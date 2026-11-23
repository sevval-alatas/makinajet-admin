<template>
  <div class="change-password-page">
    <!-- Üst Başlık Çubuğu -->
    <header class="page-topbar mj-card">
      <div>
        <h1 class="page-title">Hesap Güvenliği & Şifre Değiştirme</h1>
        <p class="page-subtitle">
          Yönetici hesabınızın (`{{ authStore.user?.email || authStore.user?.name || 'Admin' }}`) giriş şifresini güvenli şekilde güncelleyin
        </p>
      </div>
      <span class="mj-badge-green">Role == "{{ authStore.currentRole || 'Admin' }}"</span>
    </header>

    <div class="password-layout">
      <!-- Sol: Şifre Değiştirme Formu -->
      <section class="password-card mj-card">
        <div class="card-header">
          <div class="card-icon-box">
            <q-icon name="lock_reset" size="22px" />
          </div>
          <div>
            <h2 class="card-title">Şifre Güncelleme Formu</h2>
            <p class="card-desc">
              Mevcut şifrenizi doğrulayarak en az 6 karakterli yeni bir şifre belirleyin
            </p>
          </div>
        </div>

        <form class="password-form" @submit.prevent="handleSubmit">
          <!-- Mevcut Şifre -->
          <div class="form-group">
            <label class="form-label" for="currentPasswordInput">Mevcut Şifre</label>
            <div class="password-input-wrap">
              <input
                id="currentPasswordInput"
                v-model="form.currentPassword"
                :type="showCurrent ? 'text' : 'password'"
                class="mj-input password-input"
                placeholder="Mevcut şifrenizi girin"
                autocomplete="current-password"
                :disabled="submitting"
              />
              <button
                type="button"
                class="toggle-eye-btn"
                tabindex="-1"
                @click="showCurrent = !showCurrent"
              >
                <q-icon :name="showCurrent ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
          </div>

          <!-- Yeni Şifre -->
          <div class="form-group">
            <label class="form-label" for="newPasswordInput">Yeni Şifre</label>
            <div class="password-input-wrap">
              <input
                id="newPasswordInput"
                v-model="form.newPassword"
                :type="showNew ? 'text' : 'password'"
                class="mj-input password-input"
                :class="{ 'mj-input--error': form.newPassword && form.newPassword.length < 6 }"
                placeholder="En az 6 karakterli yeni şifre"
                autocomplete="new-password"
                :disabled="submitting"
              />
              <button
                type="button"
                class="toggle-eye-btn"
                tabindex="-1"
                @click="showNew = !showNew"
              >
                <q-icon :name="showNew ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
            <span
              v-if="form.newPassword && form.newPassword.length < 6"
              class="field-hint field-hint--error"
            >
              Yeni şifre en az 6 karakter olmalıdır ({{ 6 - form.newPassword.length }} karakter daha girin).
            </span>
          </div>

          <!-- Yeni Şifre (Tekrar) -->
          <div class="form-group">
            <label class="form-label" for="confirmPasswordInput">Yeni Şifre (Tekrar)</label>
            <div class="password-input-wrap">
              <input
                id="confirmPasswordInput"
                v-model="form.confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                class="mj-input password-input"
                :class="{ 'mj-input--error': form.confirmPassword && !passwordsMatch }"
                placeholder="Yeni şifrenizi tekrar girin"
                autocomplete="new-password"
                :disabled="submitting"
              />
              <button
                type="button"
                class="toggle-eye-btn"
                tabindex="-1"
                @click="showConfirm = !showConfirm"
              >
                <q-icon :name="showConfirm ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
            <span
              v-if="form.confirmPassword && !passwordsMatch"
              class="field-hint field-hint--error"
            >
              Girilen yeni şifreler birbiriyle eşleşmiyor.
            </span>
          </div>

          <!-- Hata veya Başarı Mesajı Kutusu -->
          <div v-if="errorMessage" class="alert-box alert-box--error">
            <q-icon name="error_outline" size="19px" />
            <span>{{ errorMessage }}</span>
          </div>

          <div v-if="successMessage" class="alert-box alert-box--success">
            <q-icon name="check_circle" size="19px" />
            <span>{{ successMessage }}</span>
          </div>

          <!-- Gönder Butonu -->
          <div class="form-actions">
            <button
              type="button"
              class="reset-btn"
              :disabled="submitting"
              @click="resetForm"
            >
              Temizle
            </button>

            <button
              type="submit"
              class="submit-btn"
              :disabled="submitting || !isFormValid"
            >
              <q-spinner-dots v-if="submitting" color="white" size="18px" />
              <template v-else>
                <q-icon name="save" size="18px" />
                <span>Şifreyi Güncelle</span>
              </template>
            </button>
          </div>
        </form>
      </section>

      <!-- Sağ: Güvenlik Kuralları ve Hesap Özeti -->
      <aside class="security-sidebar">
        <div class="info-card mj-card">
          <div class="info-card-title">
            <q-icon name="verified_user" size="19px" class="text-orange" />
            <span>Şifre Güvenlik Kontrolü</span>
          </div>

          <ul class="rules-list">
            <li :class="{ 'rule-ok': form.currentPassword.trim().length > 0 }">
              <q-icon
                :name="form.currentPassword.trim().length > 0 ? 'check_circle' : 'radio_button_unchecked'"
                size="16px"
              />
              <span>Mevcut şifre girildi</span>
            </li>
            <li :class="{ 'rule-ok': form.newPassword.length >= 6 }">
              <q-icon
                :name="form.newPassword.length >= 6 ? 'check_circle' : 'radio_button_unchecked'"
                size="16px"
              />
              <span>Yeni şifre en az 6 karakter (`MinLength(6)`)</span>
            </li>
            <li :class="{ 'rule-ok': isDifferentFromCurrent }">
              <q-icon
                :name="isDifferentFromCurrent ? 'check_circle' : 'radio_button_unchecked'"
                size="16px"
              />
              <span>Mevcut şifreden farklı bir şifre</span>
            </li>
            <li :class="{ 'rule-ok': passwordsMatch && form.confirmPassword.length >= 6 }">
              <q-icon
                :name="passwordsMatch && form.confirmPassword.length >= 6 ? 'check_circle' : 'radio_button_unchecked'"
                size="16px"
              />
              <span>Yeni şifre ve tekrarı eşleşiyor</span>
            </li>
          </ul>
        </div>

        <div class="info-card mj-card">
          <div class="info-card-title">
            <q-icon name="badge" size="19px" class="text-orange" />
            <span>Aktif Yönetici Oturumu</span>
          </div>
          <div class="session-kv">
            <span>Yönetici:</span>
            <strong>{{ authStore.user?.name || 'Sistem Yöneticisi' }}</strong>
          </div>
          <div class="session-kv">
            <span>Hesap / Telefon:</span>
            <strong>{{ authStore.user?.email || authStore.user?.phone || '-' }}</strong>
          </div>
          <div class="session-kv">
            <span>Yetki Rolü:</span>
            <strong>{{ authStore.currentRole || 'Admin' }}</strong>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'

const $q = useQuasar()
const authStore = useAuthStore()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordsMatch = computed(() => {
  return Boolean(form.newPassword) && form.newPassword === form.confirmPassword
})

const isDifferentFromCurrent = computed(() => {
  return (
    Boolean(form.newPassword) &&
    Boolean(form.currentPassword) &&
    form.newPassword !== form.currentPassword
  )
})

const isFormValid = computed(() => {
  return (
    form.currentPassword.trim().length > 0 &&
    form.newPassword.length >= 6 &&
    passwordsMatch.value
  )
})

function resetForm() {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  errorMessage.value = ''
  successMessage.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.currentPassword.trim()) {
    errorMessage.value = 'Lütfen mevcut şifrenizi girin.'
    return
  }
  if (form.newPassword.length < 6) {
    errorMessage.value = 'Yeni şifre en az 6 karakter olmalıdır.'
    return
  }
  if (!passwordsMatch.value) {
    errorMessage.value = 'Yeni şifre ile şifre tekrarı eşleşmiyor.'
    return
  }
  if (form.currentPassword === form.newPassword) {
    errorMessage.value = 'Yeni şifreniz mevcut şifrenizle aynı olamaz.'
    return
  }

  submitting.value = true
  try {
    const res = await authStore.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    })

    const msg = res?.message || 'Şifreniz başarıyla güncellendi!'
    successMessage.value = msg

    $q.notify({
      type: 'positive',
      icon: 'lock_reset',
      message: msg,
      position: 'top-right',
      timeout: 3000
    })

    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (err) {
    errorMessage.value = err.message || 'Şifre güncellenirken bir hata oluştu.'
    $q.notify({
      type: 'negative',
      icon: 'error_outline',
      message: errorMessage.value,
      position: 'top-right',
      timeout: 3500
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.change-password-page {
  padding: 22px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-topbar {
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: #64748b;
}

.password-layout {
  display: grid;
  grid-template-columns: minmax(0, 560px) 360px;
  gap: 22px;
  align-items: start;
}

@media (max-width: 1024px) {
  .password-layout {
    grid-template-columns: 1fr;
  }
}

.password-card {
  padding: 24px 26px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.card-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #fff7ed;
  color: #f07419;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: #0f172a;
}

.card-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
}

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding-right: 40px !important;
}

.mj-input--error {
  border-color: #dc2626 !important;
  background-color: #fef2f2 !important;
}

.toggle-eye-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;

  &:hover {
    color: #0f172a;
    background: #f1f5f9;
  }
}

.field-hint {
  font-size: 11.5px;
  font-weight: 600;

  &--error {
    color: #dc2626;
  }
}

.alert-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;

  &--error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }

  &--success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #15803d;
  }
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.reset-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f8fafc;
    color: #0f172a;
  }
}

.submit-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  border: none;
  background: #f07419;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(240, 116, 25, 0.28);
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #e0650e;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }
}

/* Sağ Güvenlik Sütunu */
.security-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  padding: 18px 20px;
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 14px;
}

.text-orange {
  color: #f07419;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .rule-ok {
    color: #15803d;
  }
}

.session-kv {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  span {
    color: #64748b;
  }

  strong {
    color: #0f172a;
    font-weight: 700;
  }
}
</style>
