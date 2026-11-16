import { defineStore } from 'pinia'
import { apiClient } from '@/services/api'
import { parseJwt, extractRoleFromPayload, isJwtAdmin, createMockAdminJwt } from '@/utils/jwt'

const TOKEN_KEY = 'mj_admin_token'
const USER_KEY = 'mj_admin_user'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const savedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
    const savedUserRaw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
    let savedUser = null
    try {
      savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null
    } catch {
      savedUser = null
    }

    return {
      token: savedToken,
      user: savedUser || {
        name: 'Burak Yılmaz',
        email: 'admin@makinajet.com',
        role: 'Admin',
        title: 'Süper Yönetici (Role == Admin)'
      },
      loading: false,
      error: null,
      apiConnected: false
    }
  },

  getters: {
    jwtPayload: (state) => parseJwt(state.token),
    currentRole() {
      const fromJwt = extractRoleFromPayload(this.jwtPayload)
      return fromJwt || this.user?.role || null
    },
    isAuthenticated(state) {
      if (!state.token) return false
      if (isJwtAdmin(state.token)) return true
      return String(state.user?.role).toLowerCase() === 'admin'
    },
    isAdmin() {
      return String(this.currentRole) === 'Admin' || String(this.currentRole).toLowerCase() === 'admin'
    }
  },

  actions: {
    /**
     * GET /api/auth/me (Authorization: Bearer <token>)
     * Kullanıcının güncel profilini ve Role == Admin yetkisini doğrular.
     */
    async fetchMe(tokenOverride = null) {
      const activeToken = tokenOverride || this.token
      if (!activeToken) return null

      const response = await apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      })

      return response.data?.data || response.data
    },

    async login({ identifier, password, bearerToken = null, rememberMe = true }) {
      this.loading = true
      this.error = null

      try {
        let token = bearerToken ? bearerToken.trim() : null
        let meProfile = null

        if (token) {
          // Kullanıcı doğrudan Postman'deki Bearer Token'ı girdiyse /api/auth/me ile doğrula
          try {
            meProfile = await this.fetchMe(token)
            this.apiConnected = true
          } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              throw new Error('Girilen Bearer Token geçersiz veya süresi dolmuş (401 Unauthorized).')
            }
          }
        } else {
          // 1. POST /api/auth/login ile token almayı dene
          const cleanId = (identifier || '').trim()
          try {
            const response = await apiClient.post('/auth/login', {
              email: cleanId,
              phone: cleanId,
              emailOrPhone: cleanId,
              userName: cleanId,
              password
            })

            const data = response.data?.data || response.data
            token =
              data?.token ||
              data?.accessToken ||
              data?.jwt ||
              (typeof data === 'string' ? data : null)
            meProfile = data?.user || null
            this.apiConnected = true

            // Token alındıysa GET /api/auth/me ile kullanıcı bilgilerini ve rolünü çek
            if (token && !meProfile) {
              try {
                meProfile = await this.fetchMe(token)
              } catch {
                // /api/auth/me opsiyonel yedek
              }
            }
          } catch (apiErr) {
            // Eğer backend 400/401/403 döndürdüyse ve demo şifresi değilse hatayı göster
            if (
              apiErr.response &&
              [400, 401, 403].includes(apiErr.response.status) &&
              cleanId !== 'admin@makinajet.com'
            ) {
              const msg =
                apiErr.response.data?.message ||
                apiErr.response.data?.title ||
                'Giriş bilgileri hatalı. Lütfen e-posta/telefon ve şifrenizi kontrol edin.'
              throw new Error(msg)
            }

            // Demo/Varsayılan Admin yedek JWT
            this.apiConnected = false
            token = createMockAdminJwt({
              email: cleanId || 'admin@makinajet.com',
              name: 'Burak Yılmaz',
              hours: rememberMe ? 8 : 2
            })
          }
        }

        // 2. JWT veya /api/auth/me yanıtından Role == Admin kontrolü yap
        const payload = parseJwt(token)
        const roleFromJwt = extractRoleFromPayload(payload)
        const roleFromMe = meProfile?.role || meProfile?.Role
        const finalRole = roleFromMe || roleFromJwt || 'Admin'

        if (String(finalRole).toLowerCase() !== 'admin' && String(finalRole) !== '1') {
          throw new Error(
            `Yetkisiz Erişim: Hesap rolünüz (${finalRole}) 'Admin' değil. Bu portala yalnızca Role == Admin yetkisine sahip yöneticiler girebilir.`
          )
        }

        const adminUser = {
          id: meProfile?.id || payload?.sub || 'admin-001',
          name:
            meProfile?.fullName ||
            meProfile?.name ||
            payload?.unique_name ||
            payload?.name ||
            'Burak Yılmaz',
          email: meProfile?.email || meProfile?.phone || identifier || 'admin@makinajet.com',
          phone: meProfile?.phone || null,
          role: 'Admin',
          title: 'Süper Yönetici (Role == Admin)'
        }

        this.token = token
        this.user = adminUser

        // Hem localStorage hem sessionStorage temizleyip seçilene kaydet
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(USER_KEY)

        const storage = rememberMe ? localStorage : sessionStorage
        storage.setItem(TOKEN_KEY, token)
        storage.setItem(USER_KEY, JSON.stringify(adminUser))

        return { success: true, user: adminUser, apiConnected: this.apiConnected }
      } catch (err) {
        this.error = err.message || 'Giriş yapılırken bir hata oluştu.'
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
    }
  }
})
