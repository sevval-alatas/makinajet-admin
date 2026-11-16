<template>
  <div class="login-viewport">
    <!-- Arka Plan Ambiyans Işıkları -->
    <div class="ambient-glow ambient-glow--orange"></div>
    <div class="ambient-glow ambient-glow--blue"></div>

    <div class="login-card">
      <!-- Üst Koyu Başlık Alanı -->
      <div class="login-card-header">
        <div class="logo-holder">
          <MakinaJetLogo />
        </div>

        <div class="portal-title-row">
          <h1 class="portal-title">Yönetim & Moderasyon Portalı</h1>
          <span class="version-pill">V2.4</span>
        </div>

        <p class="portal-subtitle">
          Bu alana sadece yetkili sistem yöneticileri erişebilir.
        </p>
      </div>

      <!-- Orta Beyaz Form Alanı -->
      <form class="login-card-body" @submit.prevent="onSubmit">
        <!-- Hata / Rol Uyarı Kutusu -->
        <div v-if="errorMessage" class="auth-error-banner">
          <q-icon name="gpp_bad" size="18px" class="q-mr-xs" />
          <span>{{ errorMessage }}</span>
        </div>

        <template v-if="!useBearerMode">
          <!-- Yönetici E-Postası veya Telefon -->
          <div class="field-group">
            <div class="field-label-row">
              <label class="field-label" for="admin-identifier">Yönetici E-Postası</label>
              <span class="field-hint">LDAP / Veritabanı</span>
            </div>

            <div class="input-box">
              <q-icon name="contact_mail" size="18px" class="input-icon-left" />
              <input
                id="admin-identifier"
                v-model="identifier"
                type="text"
                required
                placeholder="admin@makinajet.com veya telefon no"
                class="native-input"
                autocomplete="username"
              />
            </div>
          </div>

          <!-- Şifre -->
          <div class="field-group q-mt-md">
            <div class="field-label-row">
              <label class="field-label" for="admin-password">Şifre</label>
              <button
                type="button"
                class="forgot-link"
                @click="handleForgotPassword"
              >
                Şifremi Sıfırla
              </button>
            </div>

            <div class="input-box">
              <q-icon name="lock_outline" size="18px" class="input-icon-left" />
              <input
                id="admin-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••••••••••"
                class="native-input"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="eye-toggle-btn"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
          </div>
        </template>

        <!-- Alternatif: Postman JWT Bearer Token ile Doğrudan Giriş (/api/auth/me) -->
        <template v-else>
          <div class="field-group">
            <div class="field-label-row">
              <label class="field-label" for="bearer-input">JWT Bearer Token (`/api/auth/me`)</label>
              <span class="field-hint">Authorization: Bearer</span>
            </div>
            <textarea
              id="bearer-input"
              v-model="customBearerToken"
              rows="4"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="mj-input"
              style="font-family: monospace; font-size: 11.5px"
            ></textarea>
          </div>
        </template>

        <!-- 8 Saat Oturumu Açık Tut & Mod Değiştirici -->
        <div class="remember-row q-mt-md justify-between">
          <label class="remember-label">
            <input v-model="rememberMe" type="checkbox" class="remember-checkbox" />
            <span class="custom-check">
              <q-icon v-if="rememberMe" name="check" size="12px" color="white" />
            </span>
            <span class="remember-text">Bu cihazda oturumu açık tut (8 Saat)</span>
          </label>

          <button
            type="button"
            class="forgot-link"
            @click="useBearerMode = !useBearerMode"
          >
            {{ useBearerMode ? 'E-Posta ile Giriş' : 'Bearer Token Gir' }}
          </button>
        </div>

        <!-- Giriş Yap Butonu -->
        <button
          type="submit"
          class="login-submit-btn q-mt-lg"
          :disabled="authStore.loading"
        >
          <q-spinner-dots v-if="authStore.loading" color="white" size="20px" />
          <template v-else>
            <q-icon name="login" size="18px" />
            <span>Güvenli Giriş Yap (Panel)</span>
          </template>
        </button>
      </form>

      <!-- Alt Durum Çubuğu -->
      <div class="login-card-footer">
        <div class="footer-stat">
          <span class="stat-label">Sunucu Durumu:</span>
          <span class="stat-value stat-value--green">Aktif (İstanbul DC)</span>
        </div>
        <div class="footer-stat">
          <span class="stat-label">IP Yetkilendirme:</span>
          <span class="stat-value stat-value--dark">Açık</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import MakinaJetLogo from '@/components/MakinaJetLogo.vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const identifier = ref('admin@makinajet.com')
const password = ref('MakinaJet2026!')
const customBearerToken = ref('')
const useBearerMode = ref(false)
const rememberMe = ref(true)
const showPassword = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''
  try {
    const result = await authStore.login({
      identifier: identifier.value,
      password: password.value,
      bearerToken: useBearerMode.value ? customBearerToken.value : null,
      rememberMe: rememberMe.value
    })

    $q.notify({
      type: 'positive',
      message: `Hoş geldiniz, ${result.user.name}. JWT (Role == Admin) doğrulandı.`,
      position: 'top-right',
      timeout: 2500
    })

    const redirectPath = route.query.redirect || '/moderation'
    router.push(String(redirectPath))
  } catch (err) {
    errorMessage.value = err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
  }
}

function handleForgotPassword() {
  $q.notify({
    type: 'warning',
    message: 'Sistem yöneticisi şifre sıfırlama bağlantısı kurumsal e-postanıza (LDAP) iletildi.',
    position: 'top'
  })
}
</script>

<style scoped lang="scss">
.login-viewport {
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 50% 35%, #182b42 0%, #0f1b29 70%, #0a121c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  pointer-events: none;
  opacity: 0.25;

  &--orange {
    width: 420px;
    height: 420px;
    background: #f07419;
    top: -100px;
    left: -100px;
  }

  &--blue {
    width: 460px;
    height: 460px;
    background: #1d4ed8;
    bottom: -120px;
    right: -100px;
  }
}

.login-card {
  width: 100%;
  max-width: 430px;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.login-card-header {
  background: #0d1622;
  padding: 28px 28px 24px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo-holder {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.portal-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.portal-title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.2px;
}

.version-pill {
  background: #f07419;
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1.4;
}

.portal-subtitle {
  margin: 6px 0 0;
  font-size: 11.5px;
  color: #94a3b8;
}

.login-card-body {
  padding: 26px 28px 24px;
  background: #ffffff;
}

.auth-error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}

.field-label {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.field-hint {
  font-size: 10.5px;
  color: #94a3b8;
  font-weight: 500;
}

.forgot-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  font-weight: 700;
  color: #f07419;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-left {
  position: absolute;
  left: 13px;
  color: #64748b;
  pointer-events: none;
}

.native-input {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 40px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 500;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #f07419;
    box-shadow: 0 0 0 3px rgba(240, 116, 25, 0.12);
  }
}

.eye-toggle-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;

  &:hover {
    color: #475569;
  }
}

.remember-row {
  display: flex;
  align-items: center;
}

.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.remember-checkbox {
  display: none;
}

.custom-check {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  transition: all 0.15s;
}

.remember-checkbox:checked + .custom-check {
  background: #f07419;
  border-color: #f07419;
}

.remember-text {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.login-submit-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(180deg, #f37b21 0%, #e46812 100%);
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(240, 116, 25, 0.28);
  transition: transform 0.1s, filter 0.15s;

  &:hover:not(:disabled) {
    filter: brightness(1.04);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.login-card-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 13px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
}

.stat-label {
  color: #64748b;
  margin-right: 4px;
}

.stat-value {
  font-weight: 700;

  &--green {
    color: #16a34a;
  }

  &--dark {
    color: #0f172a;
  }
}
</style>
