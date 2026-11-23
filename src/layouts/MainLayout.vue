<template>
  <div class="admin-shell">
    <!-- Sol Koyu Lacivert Sidebar -->
    <aside class="admin-sidebar">
      <!-- Üst Logo & ADMIN Rozeti -->
      <div class="sidebar-brand">
        <MakinaJetLogo size="sm" />
        <!-- <span class="admin-pill">ADMIN</span> -->
      </div>

      <!-- Yönetici Profil Kartı -->
      <div class="sidebar-profile">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar">
            <span>{{ userInitials }}</span>
          </div>
          <span class="online-dot"></span>
        </div>
        <div class="profile-info">
          <div class="profile-name">{{ authStore.user?.name || 'Sistem Yöneticisi' }}</div>
          <div class="profile-role">Süper Yönetici (Role == {{ authStore.currentRole || 'Admin' }})</div>
        </div>
        <button
          class="logout-icon-btn"
          title="Bearer Token (/api/auth/me) & Oturum Bilgisi"
          @click="openJwtModal"
        >
          <q-icon name="verified_user" size="16px" />
        </button>
      </div>

      <!-- Menü Grupları -->
      <nav class="sidebar-nav">
        <div class="nav-section-label">İŞLEMLER</div>

        <router-link
          to="/moderation"
          class="nav-item"
          :class="{ 'nav-item--active': route.path.startsWith('/moderation') }"
        >
          <div class="nav-item-left">
            <q-icon name="fact_check" size="19px" class="nav-icon" />
            <span>İlan Moderasyonu</span>
          </div>
          <span v-if="moderationStore.totalPendingBadgeCount > 0" class="nav-badge">
            {{ moderationStore.totalPendingBadgeCount }}
          </span>
        </router-link>

        <router-link
          to="/stores"
          class="nav-item"
          :class="{ 'nav-item--active': route.path.startsWith('/stores') }"
        >
          <div class="nav-item-left">
            <q-icon name="storefront" size="19px" class="nav-icon" />
            <span>Mağaza Onayları</span>
          </div>
          <span v-if="pendingStoresBadgeCount > 0" class="nav-badge">
            {{ pendingStoresBadgeCount }}
          </span>
        </router-link>

        <router-link
          to="/listings"
          class="nav-item"
          :class="{ 'nav-item--active': route.path.startsWith('/listings') }"
        >
          <div class="nav-item-left">
            <q-icon name="inventory_2" size="19px" class="nav-icon" />
            <span>Tüm İlanlar</span>
          </div>
        </router-link>

        <router-link
          to="/settings"
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/settings' && !route.query.section }"
        >
          <div class="nav-item-left">
            <q-icon name="tune" size="19px" class="nav-icon" />
            <span>Kategori, Banner & Fiyatlar</span>
          </div>
        </router-link>

        <router-link
          :to="{ path: '/settings', query: { section: 'credits' } }"
          class="nav-item nav-item--sub"
          :class="{ 'nav-item--active': route.path === '/settings' && route.query.section === 'credits' }"
        >
          <div class="nav-item-left">
            <q-icon name="paid" size="19px" class="nav-icon" />
            <span>Doping & Vitrin Ücretleri (TL)</span>
          </div>
        </router-link>

        <div class="nav-section-label q-mt-lg">SİSTEM</div>

        <router-link
          to="/users"
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/users' }"
        >
          <div class="nav-item-left">
            <q-icon name="storefront" size="19px" class="nav-icon" />
            <span>Mağaza & Kullanıcılar</span>
          </div>
        </router-link>

        <router-link
          to="/payments"
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/payments' }"
        >
          <div class="nav-item-left">
            <q-icon name="receipt_long" size="19px" class="nav-icon" />
            <span>Ödeme & Faturalar</span>
          </div>
        </router-link>

        <router-link
          to="/reports"
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/reports' }"
        >
          <div class="nav-item-left">
            <q-icon name="analytics" size="19px" class="nav-icon" />
            <span>Pazaryeri Raporları</span>
          </div>
        </router-link>

        <router-link
          to="/change-password"
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/change-password' }"
        >
          <div class="nav-item-left">
            <q-icon name="lock_reset" size="19px" class="nav-icon" />
            <span>Şifre Değiştir</span>
          </div>
        </router-link>
      </nav>

      <!-- Alt Kısım: Mobil Uygulamaya Git & Çıkış -->
      <div class="sidebar-footer">
        <a
          href="http://localhost:5083"
          target="_blank"
          rel="noopener noreferrer"
          class="mobile-app-link"
        >
          <div class="mobile-app-link-left">
            <q-icon name="smartphone" size="17px" class="text-orange" />
            <span>Mobil Uygulamaya Git</span>
          </div>
          <q-icon name="open_in_new" size="15px" class="text-grey-5" />
        </a>

        <button class="logout-bar-btn" @click="handleLogout">
          <q-icon name="logout" size="16px" />
          <span>Oturumu Kapat</span>
        </button>
      </div>
    </aside>

    <!-- Sağ Ana İçerik Alanı -->
    <main class="admin-main">
      <router-view />
    </main>

    <!-- JWT Rol & Bearer Token (/api/auth/me) Doğrulama Modalı -->
    <q-dialog v-model="showJwtModal">
      <q-card style="min-width: 500px; border-radius: 14px">
        <q-card-section class="bg-dark text-white row items-center justify-between">
          <div class="row items-center q-gutter-sm">
            <q-icon name="security" color="orange" size="22px" />
            <div class="text-subtitle1 text-weight-bold">Bearer Token & `/api/auth/me` Kontrolü</div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup color="grey-4" />
        </q-card-section>

        <q-card-section class="q-gutter-y-sm">
          <div class="row items-center justify-between q-pa-sm bg-green-1 rounded-borders">
            <span class="text-caption text-weight-bold text-green-9">Yetki Kontrolü:</span>
            <span class="mj-badge-green">Role == "{{ authStore.currentRole }}" (Doğrulandı)</span>
          </div>

          <div class="text-caption text-weight-bold text-grey-8 q-mt-sm">
            Aktif Bearer Token (Postman'deki token'ı buraya yapıştırıp güncelleyebilirsiniz):
          </div>
          <textarea
            v-model="editableBearerToken"
            rows="3"
            class="mj-input"
            style="font-family: monospace; font-size: 11px"
            placeholder="eyJhbGciOiJIUzI1NiIs..."
          ></textarea>

          <div class="row justify-end">
            <q-btn
              unelevated
              color="primary"
              size="sm"
              no-caps
              icon="sync"
              label="Token'ı Kaydet & /api/auth/me Doğrula"
              :loading="verifyingToken"
              @click="applyCustomBearerToken"
            />
          </div>

          <div class="text-caption text-grey-7 q-mt-xs">Çözümlenen JWT Payload:</div>
          <pre class="jwt-pre">{{ JSON.stringify(authStore.jwtPayload, null, 2) }}</pre>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Kapat" color="grey-8" v-close-popup no-caps />
          <q-btn
            unelevated
            color="negative"
            icon="logout"
            label="Güvenli Çıkış Yap"
            no-caps
            @click="handleLogout"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import MakinaJetLogo from '@/components/MakinaJetLogo.vue'
import { useAuthStore } from '@/stores/authStore'
import { useModerationStore } from '@/stores/moderationStore'
import { apiClient } from '@/services/api'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const moderationStore = useModerationStore()

const showJwtModal = ref(false)
const editableBearerToken = ref('')
const verifyingToken = ref(false)
const pendingStoresBadgeCount = ref(0)

async function refreshPendingStoresBadge() {
  if (!authStore.token) return
  try {
    const res = await apiClient.get('/admin/stores', {
      params: { status: 'Pending' }
    })
    const list = res.data?.items || res.data?.data || res.data
    if (Array.isArray(list)) {
      pendingStoresBadgeCount.value = list.length
    }
  } catch {
    // ignore
  }
}

watch(
  () => route.path,
  () => {
    refreshPendingStoresBadge()
  }
)

const userInitials = computed(() => {
  const name = authStore.user?.name || 'Sistem Yöneticisi'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

onMounted(async () => {
  // Oturum açıldığında /api/auth/me ile kullanıcı bilgilerini senkronize et
  if (authStore.token) {
    refreshPendingStoresBadge()
    try {
      const me = await authStore.fetchMe()
      if (me?.fullName || me?.name) {
        authStore.user = {
          ...authStore.user,
          name: me.fullName || me.name
        }
      }
    } catch {
      // ignore
    }
  }
})

function openJwtModal() {
  editableBearerToken.value = authStore.token || ''
  showJwtModal.value = true
}

async function applyCustomBearerToken() {
  if (!editableBearerToken.value.trim()) return
  verifyingToken.value = true
  try {
    await authStore.login({
      bearerToken: editableBearerToken.value.trim(),
      rememberMe: true
    })
    await moderationStore.fetchPendingListings(false)
    $q.notify({
      type: 'positive',
      message: 'Bearer Token kaydedildi, /api/auth/me doğrulandı ve veriler yenilendi!'
    })
    showJwtModal.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Token doğrulanamadı.'
    })
  } finally {
    verifyingToken.value = false
  }
}

function handleLogout() {
  showJwtModal.value = false
  authStore.logout()
  $q.notify({
    type: 'info',
    message: 'Yönetici oturumu güvenli şekilde sonlandırıldı.',
    position: 'top-right'
  })
  router.push('/login')
}
</script>

<style scoped lang="scss">
.admin-shell {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.admin-sidebar {
  width: 265px;
  min-width: 265px;
  background: linear-gradient(180deg, #132030 0%, #0f1926 100%);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1e293b;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 20;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.admin-pill {
  background: rgba(240, 116, 25, 0.14);
  color: #f07419;
  border: 1px solid rgba(240, 116, 25, 0.35);
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.5px;
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.profile-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #f07419;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
}

.online-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid #132030;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-role {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-icon-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #38bdf8;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(56, 189, 248, 0.15);
  }
}

.sidebar-nav {
  flex: 1;
  padding: 18px 14px;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.8px;
  padding: 0 10px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-radius: 10px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 5px;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
  }

  &--active {
    background: #f07419 !important;
    color: #ffffff !important;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(240, 116, 25, 0.3);

    .nav-icon {
      color: #ffffff;
    }

    .nav-badge {
      background: #ffffff;
      color: #ea580c;
    }
  }
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 11px;
}

.nav-icon {
  color: #94a3b8;
}

.nav-badge {
  background: #f07419;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1.3;
}

.sidebar-footer {
  padding: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-app-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #e2e8f0;
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 600;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.mobile-app-link-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.text-orange {
  color: #f07419;
}

.logout-bar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;

  &:hover {
    color: #f87171;
    background: rgba(248, 113, 113, 0.08);
  }
}

.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.jwt-pre {
  background: #0f172a;
  color: #38bdf8;
  padding: 12px;
  border-radius: 8px;
  font-size: 11.5px;
  overflow-x: auto;
  margin: 0;
  max-height: 180px;
}
</style>
