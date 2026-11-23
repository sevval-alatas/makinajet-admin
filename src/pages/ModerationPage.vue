<template>
  <div class="moderation-page">
    <!-- Üst Başlık Çubuğu -->
    <header class="page-topbar">
      <div class="topbar-left">
        <h1 class="page-title">İlan Moderasyon Merkezi</h1>
        <span class="pending-count-pill">
          Onay Bekleyen: {{ moderationStore.totalPendingBadgeCount }} İlan
        </span>
      </div>

      <div class="topbar-right">
        <!-- Arama Kutusu -->
        <div class="search-input-wrap">
          <q-icon name="search" size="18px" class="search-icon" />
          <input
            v-model="moderationStore.searchQuery"
            type="text"
            placeholder="İlan no, başlık veya satıcı ara..."
            class="search-input"
          />
          <button
            v-if="moderationStore.searchQuery"
            class="clear-search-btn"
            @click="moderationStore.searchQuery = ''"
          >
            <q-icon name="close" size="15px" />
          </button>
        </div>

        <!-- Filtrele Butonu -->
        <q-btn-dropdown
          flat
          no-caps
          class="filter-btn"
          icon="filter_list"
          :label="filterLabel"
        >
          <q-list dense style="min-width: 190px">
            <q-item clickable v-close-popup @click="moderationStore.conditionFilter = 'ALL'">
              <q-item-section>Tüm İlanlar</q-item-section>
              <q-item-section side v-if="moderationStore.conditionFilter === 'ALL'">
                <q-icon name="check" color="primary" size="16px" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="moderationStore.conditionFilter = 'Sıfır'">
              <q-item-section>Sadece Sıfır Makineler</q-item-section>
              <q-item-section side v-if="moderationStore.conditionFilter === 'Sıfır'">
                <q-icon name="check" color="primary" size="16px" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="moderationStore.conditionFilter = 'İkinci El'">
              <q-item-section>Sadece İkinci El</q-item-section>
              <q-item-section side v-if="moderationStore.conditionFilter === 'İkinci El'">
                <q-icon name="check" color="primary" size="16px" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Bildirim Zili -->
        <button class="notif-btn" title="Son Moderasyon İşlemleri">
          <q-icon name="notifications" size="20px" />
          <span class="notif-dot"></span>
          <q-menu anchor="bottom right" self="top right">
            <div class="q-pa-md" style="width: 310px">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Son Moderasyon İşlemleri</div>
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="negative"
                  icon="delete_sweep"
                  label="Temizle"
                  :disable="moderationStore.actionHistory.length === 0"
                  @click="confirmClearNotifications"
                />
              </div>
              <div v-if="moderationStore.actionHistory.length === 0" class="text-caption text-grey-6">
                Bu oturumda henüz onay/ret işlemi yapılmadı.
              </div>
              <div
                v-for="log in moderationStore.actionHistory"
                :key="log.id"
                class="q-py-xs border-bottom text-caption row items-center justify-between"
              >
                <div>
                  <strong class="text-primary">{{ log.code }}</strong> — {{ log.action }}
                </div>
                <span class="text-grey-6">{{ log.timestamp }}</span>
              </div>
            </div>
          </q-menu>
        </button>
      </div>
    </header>

    <!-- Ana İki Sütunlu Gövde -->
    <div class="moderation-body">
      <!-- SOL SÜTUN: Kuyruk Sırası -->
      <section class="queue-column">
        <div class="queue-header">
          <div class="queue-header-title">
            <strong>Kuyruk Sırası</strong>
            <span class="queue-sub">(En eskiden en yeniye)</span>
          </div>
          <button
            class="refresh-queue-btn"
            @click="handleRefreshQueue"
          >
            <q-icon name="refresh" size="15px" />
            <span>Yenile</span>
          </button>
        </div>

        <div v-if="moderationStore.filteredListings.length === 0" class="empty-queue-box mj-card">
          <q-icon name="task_alt" size="42px" color="positive" />
          <div class="text-subtitle1 text-weight-bold q-mt-sm">Kuyrukta İlan Bulunmuyor</div>
          <p class="text-caption text-grey-6 q-mb-md">
            Onay bekleyen tüm ilanlar incelendi veya arama kriterine uygun ilan bulunamadı.
          </p>
          <q-btn
            unelevated
            color="primary"
            no-caps
            icon="refresh"
            label="Sunucudan Yenile"
            :loading="moderationStore.loading"
            @click="moderationStore.fetchPendingListings()"
          />
        </div>

        <div class="queue-list">
          <article
            v-for="item in moderationStore.filteredListings"
            :key="item.id"
            class="queue-card"
            :class="{ 'queue-card--active': selectedItem?.id === item.id }"
            @click="selectListingCard(item.id)"
          >
            <span v-if="selectedItem?.id === item.id" class="active-corner-dot"></span>

            <div class="queue-card-thumb">
              <img
                v-if="item.thumbnail && !isImageBroken(`thumb-${item.id}`)"
                :src="item.thumbnail"
                :alt="item.title"
                @error="markImageBroken(`thumb-${item.id}`)"
              />
              <div v-else class="thumb-fallback">
                <q-icon name="image_not_supported" size="22px" class="thumb-fallback-icon" />
              </div>
            </div>

            <div class="queue-card-content">
              <div class="queue-card-top">
                <span class="listing-code">{{ item.code }}</span>
                <span class="listing-time">{{ item.relativeTime }}</span>
              </div>

              <h3 class="listing-title">{{ item.title }}</h3>
              <div class="listing-seller">Satıcı: {{ item.sellerName }}</div>

              <div class="queue-card-bottom">
                <span class="listing-price">{{ item.formattedPrice }}</span>
                <span
                  :class="item.condition === 'Sıfır' ? 'mj-badge-blue' : 'mj-badge-secondhand'"
                >
                  {{ item.condition }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- SAĞ SÜTUN: Seçili İlan Detay ve Moderasyon Aksiyonları -->
      <section v-if="selectedItem" class="detail-column mj-card">
        <!-- Üst İlan Başlığı & Aksiyon Butonları -->
        <div class="detail-header">
          <div class="detail-header-left">
            <div class="detail-meta-row">
              <span class="detail-code">İLAN NO:<br />{{ selectedItem.code }}</span>
              <span class="pending-status-pill">Onay<br />Bekliyor</span>
              <span class="detail-date">{{ selectedItem.createdAtFormatted }}</span>
              <span v-if="selectedItem.isFeatured" class="featured-pill">
                ★ Vitrin Seçildi
              </span>
            </div>

            <h2 class="detail-main-title">{{ selectedItem.fullTitle }}</h2>
          </div>

          <div class="detail-actions">
            <!-- Öne Çıkar (Vitrin) -->
            <button
              type="button"
              class="action-btn action-btn--feature"
              :class="{ 'action-btn--feature-active': selectedItem.isFeatured }"
              @click="handleFeature(selectedItem)"
            >
              <q-icon name="auto_awesome" size="16px" />
              <span>{{ selectedItem.isFeatured ? 'Vitrinde Öne Çıkarıldı' : 'Öne Çıkar (Vitrin)' }}</span>
            </button>

            <!-- Reddet -->
            <button
              type="button"
              class="action-btn action-btn--reject"
              @click="focusRejectionBox"
            >
              <q-icon name="cancel" size="16px" />
              <span>Reddet</span>
            </button>

            <!-- Tek Tıkla Onayla -->
            <button
              type="button"
              class="action-btn action-btn--approve"
              @click="handleApprove(selectedItem)"
            >
              <q-icon name="check_circle" size="16px" />
              <span>Tek Tıkla Onayla</span>
            </button>
          </div>
        </div>

        <div class="detail-divider"></div>

        <!-- Yüklenen Makine Fotoğrafları -->
        <div class="photos-section">
          <div class="photos-header">
            <div class="photos-title-wrap">
              <q-icon name="collections" size="18px" class="text-orange" />
              <span class="photos-title">
                Yüklenen Makine Fotoğrafları ({{ selectedItem.photos.length }} Adet)
              </span>
            </div>
            <span v-if="selectedItem.photos.length > 0" class="photos-hint">
              Büyütmek ve kaliteyi kontrol etmek için tıklayın
            </span>
          </div>

          <div v-if="selectedItem.photos.length === 0" class="no-photos-box">
            <q-icon name="hide_image" size="30px" class="no-photos-icon" />
            <div class="no-photos-title">Fotoğraf Yüklenmemiş</div>
            <div class="no-photos-sub">Satıcı bu ilan için henüz makine fotoğrafı eklememiş.</div>
          </div>

          <div v-else class="photos-grid">
            <div
              v-for="(photo, idx) in selectedItem.photos"
              :key="photo.id"
              class="photo-card"
              :class="{ 'photo-card--cover': idx === 0 }"
              @click="openLightbox(idx)"
            >
              <img
                v-if="photo.url && !isImageBroken(`photo-${selectedItem.id}-${photo.id}`)"
                :src="photo.url"
                :alt="photo.title"
                class="photo-img"
                @error="markImageBroken(`photo-${selectedItem.id}-${photo.id}`)"
              />
              <div v-else class="photo-fallback">
                <q-icon name="broken_image" size="28px" class="photo-fallback-icon" />
                <span class="photo-fallback-text">Görsel Yüklenemedi</span>
              </div>

              <span v-if="photo.topBadge" class="photo-top-badge">
                {{ photo.topBadge }}
              </span>

              <span class="photo-bottom-badge">
                {{ photo.label }}
              </span>

              <div
                v-if="photo.url && !isImageBroken(`photo-${selectedItem.id}-${photo.id}`)"
                class="photo-hover-overlay"
              >
                <q-icon name="zoom_in" size="26px" color="white" />
              </div>
            </div>
          </div>
        </div>

        <!-- İlan & Fiyat Parametreleri VE Satıcı Doğrulama Durumu -->
        <div class="info-cards-grid">
          <!-- Sol Bilgi Kartı: İlan & Fiyat Parametreleri -->
          <div class="info-subcard">
            <div class="subcard-heading">İLAN & FİYAT PARAMETRELERİ</div>

            <div class="params-grid">
              <div class="param-cell">
                <span class="param-label">Kategori:</span>
                <span class="param-val">{{ selectedItem.category }}</span>
              </div>

              <div class="param-cell">
                <span class="param-label">Fiyat:</span>
                <span class="param-val param-val--price">{{ selectedItem.formattedPrice }}</span>
              </div>

              <div class="param-cell">
                <span class="param-label">Marka:</span>
                <span class="param-val">{{ selectedItem.brand }}</span>
              </div>

              <div class="param-cell">
                <span class="param-label">Model:</span>
                <span class="param-val">{{ selectedItem.model }}</span>
              </div>

              <div class="param-cell">
                <span class="param-label">Durum:</span>
                <div>
                  <span class="condition-detail-badge">
                    {{ selectedItem.conditionDetail }}
                  </span>
                </div>
              </div>

              <div class="param-cell">
                <span class="param-label">Konum:</span>
                <span class="param-val">{{ selectedItem.location }}</span>
              </div>
            </div>
          </div>

          <!-- Sağ Bilgi Kartı: Satıcı Doğrulama Durumu -->
          <div class="info-subcard">
            <div class="subcard-heading-row">
              <span class="subcard-heading">SATICI DOĞRULAMA DURUMU</span>
              <span class="verified-account-pill">Onaylı<br />Hesap</span>
            </div>

            <div class="seller-profile-row">
              <div class="seller-avatar">
                <q-icon name="storefront" size="20px" color="grey-7" />
              </div>
              <div class="seller-meta">
                <div class="seller-company-name">{{ selectedItem.sellerFullTitle }}</div>
                <div class="seller-tax-phone">
                  Vergi No: {{ selectedItem.sellerTaxNo }} • Tel: {{ selectedItem.sellerPhone }}
                </div>
              </div>
            </div>

            <div class="seller-stats-row">
              <div class="seller-stat-item">
                <span class="seller-stat-label">Daha önce onaylanan ilan:</span>
                <strong class="seller-stat-num">{{ selectedItem.sellerApprovedCount }}</strong>
              </div>
              <div class="seller-stat-item">
                <span class="seller-stat-label">Şikayet / İptal:</span>
                <strong class="seller-stat-num">{{ selectedItem.sellerComplaintCount }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Açıklama Metni İncelemesi -->
        <div class="description-section">
          <div class="subcard-heading q-mb-sm">AÇIKLAMA METNİ İNCELEMESİ</div>
          <div class="description-box">
            {{ selectedItem.description }}
          </div>
        </div>

        <!-- İlan Reddetme Nedeni Belirtin (Kullanıcıya SMS ve Bildirim Gider) -->
        <div
          v-if="showRejectionPanel"
          ref="rejectionBoxRef"
          class="rejection-panel"
        >
          <div class="rejection-panel-header">
            <div class="rejection-title-wrap">
              <q-icon name="warning_amber" size="18px" class="text-negative" />
              <span>İlan Reddetme Nedeni Belirtin (Kullanıcıya SMS ve Bildirim Gider)</span>
            </div>
            <button
              type="button"
              class="close-rejection-btn"
              @click="showRejectionPanel = false"
            >
              <q-icon name="close" size="16px" />
            </button>
          </div>

          <div class="rejection-form-row">
            <div class="rejection-select-wrap">
              <select v-model="selectedRejectReason" class="rejection-select">
                <option
                  v-for="reason in moderationStore.rejectionReasons"
                  :key="reason"
                  :value="reason"
                >
                  {{ reason }}
                </option>
              </select>
            </div>

            <div class="rejection-note-wrap">
              <input
                v-model="rejectCustomNote"
                type="text"
                placeholder="Ek açıklama veya düzeltme notu girin..."
                class="rejection-note-input"
                @keyup.enter="handleReject(selectedItem)"
              />
            </div>

            <button
              type="button"
              class="send-reject-btn"
              @click="handleReject(selectedItem)"
            >
              Reddi Gönder
            </button>
          </div>
        </div>
      </section>

      <!-- Sağ Sütun: Seçili İlan Yoksa Boş Durum -->
      <section v-else class="detail-column mj-card empty-detail-box">
        <q-icon name="fact_check" size="48px" color="grey-5" />
        <div class="text-subtitle1 text-weight-bold text-grey-8 q-mt-sm">
          İncelenecek İlan Seçilmedi
        </div>
        <p class="text-caption text-grey-6 q-mb-none">
          Sol kuyruktan onay bekleyen bir ilan seçtiğinizde fotoğrafları, satıcı doğrulaması ve moderasyon aksiyonları burada görüntülenecektir.
        </p>
      </section>
    </div>

    <!-- Fotoğraf Büyütme & Kalite Kontrol Lightbox Modalı -->
    <q-dialog v-model="lightboxOpen" maximized transition-show="fade" transition-hide="fade">
      <div class="lightbox-backdrop" @click.self="lightboxOpen = false">
        <div class="lightbox-container" v-if="selectedItem && currentPhoto">
          <div class="lightbox-header">
            <div>
              <div class="text-subtitle1 text-weight-bold text-white">
                {{ currentPhoto.title }}
              </div>
              <div class="text-caption text-grey-4">
                İlan: {{ selectedItem.code }} • Çözünürlük: {{ currentPhoto.resolution }}
              </div>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                outline
                color="white"
                size="sm"
                no-caps
                :icon="zoomed ? 'zoom_out' : 'zoom_in'"
                :label="zoomed ? 'Normal Boyut' : 'Yakınlaştır (2x)'"
                @click="zoomed = !zoomed"
              />
              <q-btn icon="close" flat round color="white" v-close-popup />
            </div>
          </div>

          <div class="lightbox-stage">
            <q-btn
              round
              flat
              color="white"
              icon="chevron_left"
              size="lg"
              @click="prevPhoto"
            />
            <div class="lightbox-img-holder" :class="{ 'lightbox-img-holder--zoomed': zoomed }">
              <img
                v-if="currentPhoto.url && !isImageBroken(`photo-${selectedItem.id}-${currentPhoto.id}`)"
                :src="currentPhoto.url"
                :alt="currentPhoto.title"
                @click="zoomed = !zoomed"
                @error="markImageBroken(`photo-${selectedItem.id}-${currentPhoto.id}`)"
              />
              <div v-else class="lightbox-fallback">
                <q-icon name="broken_image" size="56px" color="grey-5" />
                <div class="text-subtitle2 text-grey-4 q-mt-sm">Fotoğraf Dosyası Açılmıyor veya Bulunamadı</div>
              </div>
            </div>
            <q-btn
              round
              flat
              color="white"
              icon="chevron_right"
              size="lg"
              @click="nextPhoto"
            />
          </div>

          <div class="lightbox-thumbs">
            <div
              v-for="(p, idx) in selectedItem.photos"
              :key="p.id"
              class="lb-thumb"
              :class="{ 'lb-thumb--active': idx === activePhotoIndex }"
              @click="activePhotoIndex = idx"
            >
              <img
                v-if="p.url && !isImageBroken(`photo-${selectedItem.id}-${p.id}`)"
                :src="p.url"
                :alt="p.label"
                @error="markImageBroken(`photo-${selectedItem.id}-${p.id}`)"
              />
              <div v-else class="lb-thumb-fallback">
                <q-icon name="image_not_supported" size="20px" color="grey-5" />
              </div>
              <span>{{ p.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useModerationStore } from '@/stores/moderationStore'

const $q = useQuasar()
const moderationStore = useModerationStore()

// Yüklenemeyen / kırık görsellerin anahtar takibi
const brokenImages = reactive({})

function markImageBroken(key) {
  brokenImages[key] = true
}

function isImageBroken(key) {
  return Boolean(brokenImages[key])
}

const showRejectionPanel = ref(true)
const selectedRejectReason = ref('Fotoğraflar kalitesiz / bulanık')
const rejectCustomNote = ref('')
const rejectionBoxRef = ref(null)

// Lightbox state
const lightboxOpen = ref(false)
const activePhotoIndex = ref(0)
const zoomed = ref(false)

const selectedItem = computed(() => moderationStore.selectedListing)

const currentPhoto = computed(() => {
  if (!selectedItem.value?.photos) return null
  return selectedItem.value.photos[activePhotoIndex.value] || selectedItem.value.photos[0]
})

const filterLabel = computed(() => {
  if (moderationStore.conditionFilter === 'Sıfır') return 'Sıfır'
  if (moderationStore.conditionFilter === 'İkinci El') return 'İkinci El'
  return 'Filtrele'
})

onMounted(() => {
  moderationStore.fetchPendingListings()
})

function selectListingCard(id) {
  moderationStore.selectListing(id)
}

function handleRefreshQueue() {
  moderationStore.fetchPendingListings()
  $q.notify({
    type: 'info',
    message: 'Onay kuyruğu sunucu ile senkronize edildi.',
    position: 'top-right',
    timeout: 1800
  })
}

function confirmClearNotifications() {
  const notificationCount = moderationStore.actionHistory.length
  if (notificationCount === 0) return

  $q.dialog({
    title: 'Bildirimleri Temizle',
    message: `${notificationCount} moderasyon bildiriminin tamamı silinecek. Devam edilsin mi?`,
    cancel: { label: 'Vazgeç', flat: true, noCaps: true },
    ok: { label: 'Temizle', color: 'negative', unelevated: true, noCaps: true },
    persistent: true
  }).onOk(() => {
    moderationStore.clearActionHistory()
    $q.notify({
      type: 'info',
      message: 'Moderasyon bildirimleri temizlendi.',
      position: 'top-right'
    })
  })
}

async function handleApprove(item) {
  await moderationStore.approveListing(item.id)
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: `${item.code} (${item.title}) onaylandı ve yayına alındı!`,
    position: 'top-right',
    timeout: 2500
  })
}

async function handleFeature(item) {
  const isNowFeatured = await moderationStore.toggleFeatureListing(item.id)
  $q.notify({
    type: isNowFeatured ? 'warning' : 'info',
    icon: 'auto_awesome',
    message: isNowFeatured
      ? `${item.code} Ana Sayfa Vitrin bloğuna eklendi (Öne Çıkarıldı).`
      : `${item.code} vitrin listesinden çıkarıldı.`,
    position: 'top-right',
    timeout: 2200
  })
}

function focusRejectionBox() {
  showRejectionPanel.value = true
  nextTick(() => {
    rejectionBoxRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function handleReject(item) {
  if (!selectedRejectReason.value) {
    $q.notify({
      type: 'negative',
      message: 'Lütfen bir reddetme nedeni seçin.'
    })
    return
  }

  await moderationStore.rejectListing(item.id, {
    reason: selectedRejectReason.value,
    note: rejectCustomNote.value
  })

  $q.notify({
    type: 'negative',
    icon: 'sms_failed',
    message: `${item.code} reddedildi. Satıcıya (${item.sellerName}) SMS ve bildirim gönderildi.`,
    position: 'top-right',
    timeout: 3000
  })
}

function openLightbox(idx) {
  activePhotoIndex.value = idx
  zoomed.value = false
  lightboxOpen.value = true
}

function prevPhoto() {
  if (!selectedItem.value?.photos?.length) return
  const len = selectedItem.value.photos.length
  activePhotoIndex.value = (activePhotoIndex.value - 1 + len) % len
}

function nextPhoto() {
  if (!selectedItem.value?.photos?.length) return
  const len = selectedItem.value.photos.length
  activePhotoIndex.value = (activePhotoIndex.value + 1) % len
}
</script>

<style scoped lang="scss">
.moderation-page {
  padding: 20px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  padding: 14px 22px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.pending-count-pill {
  background: #fff7ed;
  color: #ea580c;
  border: 1px solid #fed7aa;
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 12.5px;
  font-weight: 700;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  height: 38px;
  padding: 0 32px 0 36px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 12.5px;
  color: #0f172a;
  outline: none;
  transition: all 0.15s;

  &:focus {
    background: #ffffff;
    border-color: #f07419;
    box-shadow: 0 0 0 3px rgba(240, 116, 25, 0.1);
  }
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.filter-btn {
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  height: 38px;
  padding: 0 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  background: #ffffff;
}

.notif-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
}

/* Ana Gövde */
.moderation-body {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 22px;
  align-items: start;
}

@media (max-width: 1180px) {
  .moderation-body {
    grid-template-columns: 1fr;
  }
}

/* Sol Kuyruk Sütunu */
.queue-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.queue-header-title {
  font-size: 13px;
  color: #0f172a;

  .queue-sub {
    color: #94a3b8;
    font-size: 11.5px;
    margin-left: 4px;
  }
}

.refresh-queue-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #f07419;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.empty-queue-box {
  padding: 32px 20px;
  text-align: center;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  &--active {
    border: 2px solid #f07419;
    box-shadow: 0 6px 18px rgba(240, 116, 25, 0.12);
  }
}

.active-corner-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f07419;
}

.queue-card-thumb {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: #f1f5f9;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
}

.queue-card-content {
  flex: 1;
  min-width: 0;
}

.queue-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 12px;
}

.listing-code {
  font-size: 11px;
  font-weight: 800;
  color: #f07419;
}

.listing-time {
  font-size: 10.5px;
  color: #94a3b8;
}

.listing-title {
  margin: 3px 0 2px;
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.listing-seller {
  font-size: 11.5px;
  color: #64748b;
  margin-bottom: 8px;
}

.queue-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
}

.listing-price {
  font-size: 14px;
  font-weight: 800;
  color: #dc2626;
}

/* Sağ Detay Sütunu */
.detail-column {
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-code {
  font-size: 11.5px;
  font-weight: 800;
  color: #f07419;
  line-height: 1.25;
}

.pending-status-pill {
  background: #fff7ed;
  color: #ea580c;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
}

.detail-date {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.featured-pill {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
}

.detail-main-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.25;
}

.detail-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  height: 42px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: all 0.15s ease;

  &--feature {
    background: #ffffff;
    color: #ea580c;
    border: 1.5px solid #f07419;

    &:hover {
      background: #fff7ed;
    }
  }

  &--feature-active {
    background: #fff7ed;
    box-shadow: 0 0 0 3px rgba(240, 116, 25, 0.15);
  }

  &--reject {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;

    &:hover {
      background: #fecaca;
    }
  }

  &--approve {
    background: #16a34a;
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);

    &:hover {
      background: #15803d;
    }
  }
}

.detail-divider {
  height: 1px;
  background: #f1f5f9;
}

/* Fotoğraflar Bölümü */
.photos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.photos-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.photos-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
}

.photos-hint {
  font-size: 11.5px;
  color: #94a3b8;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 900px) {
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.photo-card {
  position: relative;
  height: 116px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e2e8f0;
  background: #f1f5f9;
  cursor: pointer;

  &--cover {
    border: 2px solid #f07419;
  }

  &:hover .photo-hover-overlay {
    opacity: 1;
  }
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #f8fafc;
  color: #94a3b8;
  padding-bottom: 14px;
}

.photo-fallback-text {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
}

.no-photos-box {
  border: 1.5px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.no-photos-icon {
  color: #94a3b8;
  margin-bottom: 6px;
}

.no-photos-title {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
}

.no-photos-sub {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

.photo-top-badge {
  position: absolute;
  top: 7px;
  left: 7px;
  background: #f07419;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  z-index: 2;
}

.photo-bottom-badge {
  position: absolute;
  bottom: 7px;
  right: 7px;
  background: rgba(15, 23, 42, 0.78);
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 5px;
  z-index: 2;
}

.photo-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

/* İki Yan Yana Bilgi Kartı */
.info-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .info-cards-grid {
    grid-template-columns: 1fr;
  }
}

.info-subcard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
}

.subcard-heading {
  font-size: 11.5px;
  font-weight: 800;
  color: #334155;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
}

.subcard-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .subcard-heading {
    margin-bottom: 0;
  }
}

.params-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.param-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.param-label {
  font-size: 11px;
  color: #64748b;
}

.param-val {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;

  &--price {
    color: #dc2626;
    font-size: 14.5px;
  }
}

.condition-detail-badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.verified-account-pill {
  background: #dcfce7;
  color: #15803d;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 10px;
  line-height: 1.15;
  text-align: center;
}

.seller-profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.seller-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.seller-company-name {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.seller-tax-phone {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

.seller-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 10px;
}

.seller-stat-item {
  display: flex;
  flex-direction: column;
}

.seller-stat-label {
  font-size: 11px;
  color: #64748b;
}

.seller-stat-num {
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
}

/* Açıklama Kutusu */
.description-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #334155;
}

/* Kırmızı İlan Reddetme Kutusu */
.rejection-panel {
  background: #fef2f2;
  border: 1.5px solid #ef4444;
  border-radius: 12px;
  padding: 14px 16px;
}

.rejection-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.rejection-title-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 800;
  color: #dc2626;
}

.close-rejection-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}

.rejection-form-row {
  display: grid;
  grid-template-columns: 230px 1fr auto;
  gap: 10px;
  align-items: center;
}

@media (max-width: 900px) {
  .rejection-form-row {
    grid-template-columns: 1fr;
  }
}

.rejection-select {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0f172a;
  outline: none;
}

.rejection-note-input {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0 12px;
  font-size: 12.5px;
  color: #0f172a;
  outline: none;

  &:focus {
    border-color: #ef4444;
  }
}

.send-reject-btn {
  height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  background: #dc2626;
  color: #ffffff;
  border: none;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #b91c1c;
  }
}

/* Lightbox Stilleri */
.lightbox-backdrop {
  width: 100%;
  height: 100%;
  background: rgba(10, 18, 28, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lightbox-container {
  width: 100%;
  max-width: 980px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lightbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lightbox-stage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lightbox-img-holder {
  flex: 1;
  height: 520px;
  background: #0f172a;
  border-radius: 14px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);

  img {
    max-width: 100%;
    max-height: 100%;
    transition: transform 0.2s ease;
    cursor: zoom-in;
  }

  &--zoomed img {
    transform: scale(1.75);
    cursor: zoom-out;
  }
}

.lightbox-thumbs {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.lb-thumb {
  width: 130px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  background: #1e293b;
  cursor: pointer;
  text-align: center;

  img {
    width: 100%;
    height: 64px;
    object-fit: cover;
    display: block;
  }

  span {
    display: block;
    font-size: 11px;
    color: #cbd5e1;
    padding: 4px;
  }

  &--active {
    border-color: #f07419;
  }
}

.lightbox-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.lb-thumb-fallback {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
}

.empty-detail-box {
  padding: 80px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 420px;
}
</style>
