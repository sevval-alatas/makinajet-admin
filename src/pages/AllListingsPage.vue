<template>
  <div class="all-listings-page">
    <!-- Üst Başlık ve Arama Çubuğu -->
    <header class="listings-topbar mj-card">
      <div class="topbar-left">
        <div>
          <div class="row items-center q-gutter-x-sm">
            <h1 class="page-title">Tüm Sistem İlanları</h1>
            <span class="total-badge">
              Toplam {{ moderationStore.allListingsTotalCount }} İlan
            </span>
          </div>
          <p class="page-subtitle">
            Sistemdeki yayında, onay bekleyen, reddedilen ve satılan tüm ilanları görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      <div class="topbar-right">
        <div class="search-input-wrap">
          <q-icon name="search" size="18px" class="search-icon" />
          <input
            v-model="moderationStore.allListingsSearch"
            type="text"
            placeholder="İlan no, başlık, marka veya satıcı ara..."
            class="search-input"
            @keyup.enter="applySearch"
          />
          <button
            v-if="moderationStore.allListingsSearch"
            type="button"
            class="clear-search-btn"
            @click="clearSearch"
          >
            <q-icon name="close" size="15px" />
          </button>
        </div>

        <button
          type="button"
          class="refresh-btn"
          :disabled="moderationStore.allListingsLoading"
          @click="refreshListings"
        >
          <q-spinner-dots v-if="moderationStore.allListingsLoading" size="16px" color="primary" />
          <template v-else>
            <q-icon name="refresh" size="17px" />
            <span>Yenile</span>
          </template>
        </button>
      </div>
    </header>

    <!-- Durum Sekmeleri & Durum Filtreleri -->
    <div class="filters-bar mj-card">
      <div class="status-tabs">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.value"
          type="button"
          class="status-tab"
          :class="{
            'status-tab--active': moderationStore.allListingsStatusFilter === tab.value,
            'status-tab--archive': tab.isArchive
          }"
          @click="selectStatusTab(tab.value)"
        >
          <q-icon :name="tab.icon" size="16px" />
          <span>{{ tab.label }}</span>
          <span v-if="getTabCount(tab.value) !== null" class="tab-count-chip">
            {{ getTabCount(tab.value) }}
          </span>
        </button>
      </div>

      <div class="condition-filter-group">
        <!-- 1. Üst (Ana) Kategori Seçimi -->
        <select
          v-model="selectedRootCategoryId"
          class="mj-input cat-cascade-select"
          @change="selectedSubCategoryId = null"
        >
          <option :value="null">Tüm Üst Kategoriler</option>
          <option v-for="rc in rootCategoriesList" :key="rc.id" :value="rc.id">
            {{ rc.name }}
          </option>
        </select>

        <!-- 2. Seçilen Üst Kategorinin Alt Kategorisi Filtresi -->
        <select
          v-if="selectedRootCategoryId !== null && subCategoriesOfSelectedRoot.length > 0"
          v-model="selectedSubCategoryId"
          class="mj-input cat-cascade-select"
        >
          <option :value="null">Tüm Alt Kategoriler ({{ subCategoriesOfSelectedRoot.length }})</option>
          <option v-for="sc in subCategoriesOfSelectedRoot" :key="sc.id" :value="sc.id">
            ↳ {{ sc.name }}
          </option>
        </select>

        <button
          v-for="cond in CONDITION_OPTIONS"
          :key="cond.value"
          type="button"
          class="cond-pill"
          :class="{ 'cond-pill--active': localConditionFilter === cond.value }"
          @click="localConditionFilter = cond.value"
        >
          {{ cond.label }}
        </button>
      </div>
    </div>

    <!-- İlanlar Tablosu -->
    <section class="table-card mj-card">
      <div v-if="moderationStore.allListingsLoading && displayedListings.length === 0" class="empty-state">
        <q-spinner-dots color="primary" size="40px" />
        <div class="text-subtitle2 text-grey-7 q-mt-sm">İlanlar sunucudan yükleniyor...</div>
      </div>

      <div v-else-if="displayedListings.length === 0" class="empty-state">
        <q-icon name="inventory_2" size="46px" color="grey-5" />
        <div class="text-subtitle1 text-weight-bold text-grey-8 q-mt-sm">
          İlan Bulunamadı
        </div>
        <p class="text-caption text-grey-6 q-mb-md">
          Seçili filtre veya arama kriterlerine uygun sistem ilanı bulunmuyor.
        </p>
        <q-btn
          unelevated
          color="primary"
          no-caps
          icon="refresh"
          label="Filtreleri Sıfırla & Yenile"
          @click="resetFilters"
        />
      </div>

      <div v-else class="table-scroll">
        <table class="listings-table">
          <thead>
            <tr>
              <th style="width: 72px">GÖRSEL</th>
              <th>İLAN BİLGİSİ</th>
              <th>KATEGORİ & MARKA</th>
              <th>SATICI & KONUM</th>
              <th>FİYAT & DURUM</th>
              <th>YAYIN DURUMU</th>
              <th>TARİH</th>
              <th style="text-align: right; width: 210px">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in displayedListings"
              :key="item.id"
              class="listing-row"
              @click="openDetailModal(item)"
            >
              <!-- Görsel -->
              <td>
                <div class="row-thumb">
                  <img
                    v-if="item.thumbnail && !isImageBroken(`row-${item.id}`)"
                    :src="item.thumbnail"
                    :alt="item.title"
                    @error="markImageBroken(`row-${item.id}`)"
                  />
                  <div v-else class="row-thumb-fallback">
                    <q-icon name="image_not_supported" size="20px" />
                  </div>
                </div>
              </td>

              <!-- İlan Bilgisi -->
              <td>
                <div class="row items-center q-gutter-x-xs">
                  <span class="row-code">{{ item.code }}</span>
                  <span v-if="item.hasDoping" class="row-doping-tag">
                    ⚡ Doping
                  </span>
                  <span v-if="item.isFeatured" class="row-featured-tag">
                    ★ Vitrin
                  </span>
                  <span v-if="item.isBoldTitle" class="row-bold-tag">
                    B Kalın Yazı
                  </span>
                </div>
                <div class="row-title" :class="{ 'row-title--bold-promo': item.isBoldTitle }">
                  {{ item.title }}
                </div>
                <div class="row-photo-count">
                  <q-icon name="photo_library" size="13px" />
                  <span>{{ item.photos.length }} Fotoğraf</span>
                </div>
              </td>

              <!-- Kategori & Marka -->
              <td>
                <div class="row-category">{{ item.category }}</div>
                <div class="row-brand">{{ item.brand }} • {{ item.model }}</div>
              </td>

              <!-- Satıcı & Konum -->
              <td>
                <div class="row-seller">{{ item.sellerName }}</div>
                <div class="row-location">{{ item.location }}</div>
              </td>

              <!-- Fiyat & Makine Durumu -->
              <td>
                <div class="row-price">{{ item.formattedPrice }}</div>
                <span
                  class="q-mt-xs inline-block"
                  :class="item.condition === 'Sıfır' ? 'mj-badge-blue' : 'mj-badge-secondhand'"
                >
                  {{ item.condition }}
                </span>
              </td>

              <!-- Yayın Durumu -->
              <td>
                <span class="status-badge" :class="`status-badge--${item.status.toLowerCase()}`">
                  {{ item.statusLabel }}
                </span>
                <div v-if="item.rejectReason && item.status === 'Rejected'" class="reject-reason-hint">
                  {{ item.rejectReason }}
                </div>
              </td>

              <!-- Tarih -->
              <td>
                <div class="row-date">{{ item.createdAtFormatted }}</div>
                <div class="row-rel-time">{{ item.relativeTime }}</div>
              </td>

              <!-- İşlemler -->
              <td style="text-align: right" @click.stop>
                <div class="row-action-btns">
                  <button
                    type="button"
                    class="tbl-btn tbl-btn--view"
                    title="Detayları ve Fotoğrafları İncele"
                    @click="openDetailModal(item)"
                  >
                    <q-icon name="visibility" size="16px" />
                  </button>

                  <template v-if="!isArchivedListingStatus(item.status)">
                    <button
                      type="button"
                      class="tbl-btn tbl-btn--doping"
                      :class="{ 'tbl-btn--doping-on': item.hasDoping }"
                      :title="item.hasDoping ? 'Dopingi Kaldır' : 'Doping Tanımla (7 Gün)'"
                      @click="handleToggleDoping(item)"
                    >
                      <q-icon name="bolt" size="16px" />
                    </button>

                    <button
                      type="button"
                      class="tbl-btn tbl-btn--feature"
                      :class="{ 'tbl-btn--feature-on': item.isFeatured }"
                      :title="item.isFeatured ? 'Vitrinden Çıkar' : 'Vitrinde Öne Çıkar (7 Gün)'"
                      @click="handleToggleFeature(item)"
                    >
                      <q-icon name="auto_awesome" size="16px" />
                    </button>

                    <button
                      type="button"
                      class="tbl-btn tbl-btn--bold"
                      :class="{ 'tbl-btn--bold-on': item.isBoldTitle }"
                      :title="item.isBoldTitle ? 'Kalın Yazıyı Kaldır' : 'Kalın Yazı Tanımla (7 Gün)'"
                      @click="handleToggleBoldTitle(item)"
                    >
                      <q-icon name="format_bold" size="16px" />
                    </button>

                    <button
                      v-if="item.status !== 'Approved'"
                      type="button"
                      class="tbl-btn tbl-btn--approve"
                      title="İlanı Onayla ve Yayına Al"
                      @click="handleQuickApprove(item)"
                    >
                      <q-icon name="check_circle" size="16px" />
                    </button>

                    <button
                      type="button"
                      class="tbl-btn tbl-btn--reject"
                      title="İlanı Reddet / Yayından Kaldır (Arşive Taşı)"
                      @click="openRejectDialog(item)"
                    >
                      <q-icon name="cancel" size="16px" />
                    </button>
                  </template>
                  <span v-else class="archived-readonly-tag" title="Arşivdeki ilanlar onaylanamaz ve vitrine eklenemez">
                    <q-icon name="lock" size="13px" />
                    <span>Arşivde</span>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- İlan Detay & Fotoğraf İnceleme Modalı -->
    <q-dialog v-model="detailModalOpen">
      <q-card v-if="activeListing" style="width: 760px; max-width: 95vw; border-radius: 16px">
        <q-card-section class="row items-center justify-between border-bottom">
          <div>
            <div class="row items-center q-gutter-x-sm">
              <span class="row-code">{{ activeListing.code }}</span>
              <span
                class="status-badge"
                :class="`status-badge--${activeListing.status.toLowerCase()}`"
              >
                {{ activeListing.statusLabel }}
              </span>
              <span v-if="activeListing.isFeatured" class="row-featured-tag">★ Vitrin İlanı</span>
            </div>
            <div class="text-h6 text-weight-bold q-mt-xs">{{ activeListing.fullTitle }}</div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md" style="max-height: 75vh; overflow-y: auto">
          <!-- Fotoğraflar -->
          <div>
            <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
              MAKİNE FOTOĞRAFLARI ({{ activeListing.photos.length }} ADET)
            </div>
            <div v-if="activeListing.photos.length === 0" class="modal-no-photos">
              <q-icon name="hide_image" size="26px" color="grey-5" />
              <span>Bu ilan için fotoğraf yüklenmemiş.</span>
            </div>
            <div v-else class="modal-photos-grid">
              <div
                v-for="photo in activeListing.photos"
                :key="photo.id"
                class="modal-photo-box"
              >
                <img
                  v-if="photo.url && !isImageBroken(`modal-${activeListing.id}-${photo.id}`)"
                  :src="photo.url"
                  :alt="photo.title"
                  @error="markImageBroken(`modal-${activeListing.id}-${photo.id}`)"
                />
                <div v-else class="modal-photo-fallback">
                  <q-icon name="broken_image" size="24px" />
                  <span>Görsel Açılmıyor</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Teknik & Satıcı Bilgileri -->
          <div class="modal-info-grid">
            <div class="modal-info-card">
              <div class="modal-info-title">İLAN PARAMETRELERİ</div>
              <div class="modal-kv"><span>Kategori:</span><strong>{{ activeListing.category }}</strong></div>
              <div class="modal-kv"><span>Fiyat:</span><strong class="text-negative">{{ activeListing.formattedPrice }}</strong></div>
              <div class="modal-kv"><span>Marka / Model:</span><strong>{{ activeListing.brand }} / {{ activeListing.model }}</strong></div>
              <div class="modal-kv"><span>Makine Durumu:</span><strong>{{ activeListing.conditionDetail }}</strong></div>
              <div class="modal-kv"><span>Konum:</span><strong>{{ activeListing.location }}</strong></div>
            </div>

            <div class="modal-info-card">
              <div class="modal-info-title">SATICI BİLGİLERİ</div>
              <div class="modal-kv"><span>Satıcı Adı:</span><strong>{{ activeListing.sellerFullTitle }}</strong></div>
              <div class="modal-kv"><span>Telefon:</span><strong>{{ activeListing.sellerPhone }}</strong></div>
              <div class="modal-kv"><span>Kayıt Tarihi:</span><strong>{{ activeListing.createdAtFormatted }}</strong></div>
              <div class="modal-kv"><span>Onaylı İlan Sayısı:</span><strong>{{ activeListing.sellerApprovedCount }}</strong></div>
            </div>
          </div>

          <!-- Açıklama -->
          <div>
            <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">AÇIKLAMA METNİ</div>
            <div class="modal-desc-box">{{ activeListing.description }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="between" class="q-px-md q-py-sm border-top">
          <div v-if="!isArchivedListingStatus(activeListing.status)" class="row q-gutter-x-xs">
            <q-btn
              outline
              color="deep-orange"
              size="sm"
              no-caps
              icon="bolt"
              :label="activeListing.hasDoping ? 'Dopingi Kaldır' : 'Doping Ver (7 Gün)'"
              @click="handleToggleDoping(activeListing)"
            />
            <q-btn
              outline
              color="warning"
              size="sm"
              no-caps
              icon="auto_awesome"
              :label="activeListing.isFeatured ? 'Vitrinden Çıkar' : 'Vitrine Ekle (7 Gün)'"
              @click="handleToggleFeature(activeListing)"
            />
            <q-btn
              outline
              color="primary"
              size="sm"
              no-caps
              icon="format_bold"
              :label="activeListing.isBoldTitle ? 'Kalın Yazı Kaldır' : 'Kalın Yazı Ver (7 Gün)'"
              @click="handleToggleBoldTitle(activeListing)"
            />
          </div>
          <div v-else class="text-caption text-grey-7 row items-center q-gutter-x-xs">
            <q-icon name="lock" size="16px" color="grey-7" />
            <span>Bu ilan arşivlenmiştir; tekrar onaylanamaz veya vitrine eklenemez.</span>
          </div>

          <div class="row q-gutter-x-sm">
            <template v-if="!isArchivedListingStatus(activeListing.status)">
              <q-btn
                unelevated
                color="negative"
                no-caps
                icon="cancel"
                label="Reddet / Arşive Al"
                @click="openRejectDialog(activeListing)"
              />
              <q-btn
                v-if="activeListing.status !== 'Approved'"
                unelevated
                color="positive"
                no-caps
                icon="check_circle"
                label="Onayla ve Yayına Al"
                @click="handleQuickApprove(activeListing)"
              />
            </template>
            <q-btn flat label="Kapat" color="grey-7" no-caps v-close-popup />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reddetme Nedeni Modalı -->
    <q-dialog v-model="rejectDialogOpen">
      <q-card style="width: 460px; max-width: 95vw; border-radius: 14px">
        <q-card-section class="row items-center justify-between border-bottom">
          <div class="text-subtitle1 text-weight-bold text-negative">
            İlanı Reddet ({{ rejectingItem?.code }})
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <div>
            <label class="field-label">Reddetme Nedeni</label>
            <select v-model="rejectReason" class="mj-input">
              <option
                v-for="reason in moderationStore.rejectionReasons"
                :key="reason"
                :value="reason"
              >
                {{ reason }}
              </option>
            </select>
          </div>

          <div>
            <label class="field-label">Ek Açıklama / Satıcıya Not</label>
            <textarea
              v-model="rejectNote"
              rows="3"
              class="mj-input"
              placeholder="Satıcıya iletilecek düzeltme notunu yazın..."
            ></textarea>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Vazgeç" color="grey-7" no-caps v-close-popup />
          <q-btn
            unelevated
            color="negative"
            no-caps
            icon="send"
            label="Reddi Gönder"
            @click="confirmReject"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useModerationStore, isArchivedListingStatus } from '@/stores/moderationStore'
import { useSettingsStore } from '@/stores/settingsStore'

const $q = useQuasar()
const moderationStore = useModerationStore()
const settingsStore = useSettingsStore()

const selectedRootCategoryId = ref(null)
const selectedSubCategoryId = ref(null)

const rootCategoriesList = computed(() => {
  return settingsStore.categories.filter((c) => !c.parentId)
})

const subCategoriesOfSelectedRoot = computed(() => {
  if (selectedRootCategoryId.value === null) return []
  return settingsStore.categories.filter(
    (c) => Number(c.parentId) === Number(selectedRootCategoryId.value)
  )
})

const STATUS_TABS = [
  { value: 'ALL', label: 'Aktif İlanlar', icon: 'list_alt' },
  { value: 'Pending', label: 'Onay Bekleyenler', icon: 'hourglass_top' },
  { value: 'Approved', label: 'Yayında Olanlar', icon: 'check_circle' },
  { value: 'Sold', label: 'Satılanlar', icon: 'sell' },
  { value: 'ARCHIVE', label: 'Arşiv (Kaldırılan & Reddedilen)', icon: 'inventory_2', isArchive: true }
]

const CONDITION_OPTIONS = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'Sıfır', label: 'Sıfır' },
  { value: 'İkinci El', label: 'İkinci El' }
]

const localConditionFilter = ref('ALL')
const brokenImages = reactive({})

const detailModalOpen = ref(false)
const activeListing = ref(null)

const rejectDialogOpen = ref(false)
const rejectingItem = ref(null)
const rejectReason = ref('Fotoğraflar kalitesiz / bulanık')
const rejectNote = ref('')

function getTabCount(tabValue) {
  const list = moderationStore.allListings
  if (!Array.isArray(list) || list.length === 0) return null
  // Sadece genel listedeyken anlamlı sayaç göster
  if (
    moderationStore.allListingsStatusFilter !== 'ALL' &&
    moderationStore.allListingsStatusFilter !== 'ARCHIVE'
  ) {
    return null
  }
  if (tabValue === 'ALL') {
    return list.filter((i) => !isArchivedListingStatus(i.status)).length
  }
  if (tabValue === 'ARCHIVE') {
    return list.filter((i) => isArchivedListingStatus(i.status)).length
  }
  return list.filter((i) => i.status === tabValue).length
}

const displayedListings = computed(() => {
  const q = moderationStore.allListingsSearch.trim().toLowerCase()
  const filter = moderationStore.allListingsStatusFilter

  return moderationStore.allListings.filter((item) => {
    const isArchived = isArchivedListingStatus(item.status)

    if (filter === 'ARCHIVE') {
      // Arşiv sekmesinde sadece Kaldırılan (Passive) ve Reddedilen (Rejected) ilanlar gösterilir
      if (!isArchived) return false
    } else if (filter === 'ALL') {
      // Aktif İlanlar sekmesinde kaldırılan ve reddedilen ilanlar gizlenir (Arşiv'de tutulur)
      if (isArchived) return false
    } else if (item.status !== filter) {
      return false
    }

    if (localConditionFilter.value !== 'ALL' && item.condition !== localConditionFilter.value) {
      return false
    }

    // Üst kategori & Alt kategori kademeli filtreleme
    if (selectedSubCategoryId.value !== null) {
      const subObj = settingsStore.categories.find(
        (c) => Number(c.id) === Number(selectedSubCategoryId.value)
      )
      if (subObj) {
        const matchById = item.categoryId && Number(item.categoryId) === Number(subObj.id)
        const matchByName =
          item.category.toLowerCase() === subObj.name.toLowerCase()
        if (!matchById && !matchByName) return false
      }
    } else if (selectedRootCategoryId.value !== null) {
      const rootId = Number(selectedRootCategoryId.value)
      const allowedCats = settingsStore.categories.filter(
        (c) => Number(c.id) === rootId || Number(c.parentId) === rootId
      )
      const allowedIds = new Set(allowedCats.map((c) => Number(c.id)))
      const allowedNames = new Set(allowedCats.map((c) => c.name.toLowerCase()))

      const matchById = item.categoryId && allowedIds.has(Number(item.categoryId))
      const matchByName = allowedNames.has(item.category.toLowerCase())
      if (!matchById && !matchByName) return false
    }

    if (!q) return true
    return (
      item.code.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.sellerName.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  })
})

onMounted(() => {
  if (settingsStore.categories.length === 0) {
    settingsStore.fetchSettings()
  }
  moderationStore.fetchAllListings()
})

function markImageBroken(key) {
  brokenImages[key] = true
}

function isImageBroken(key) {
  return Boolean(brokenImages[key])
}

function selectStatusTab(statusValue) {
  moderationStore.allListingsStatusFilter = statusValue
  moderationStore.fetchAllListings()
}

function applySearch() {
  moderationStore.fetchAllListings()
}

function clearSearch() {
  moderationStore.allListingsSearch = ''
  moderationStore.fetchAllListings()
}

function refreshListings() {
  moderationStore.fetchAllListings()
  $q.notify({
    type: 'info',
    message: 'Tüm ilan listesi sunucudan güncellendi.',
    position: 'top-right',
    timeout: 1500
  })
}

function resetFilters() {
  moderationStore.allListingsStatusFilter = 'ALL'
  moderationStore.allListingsSearch = ''
  localConditionFilter.value = 'ALL'
  selectedRootCategoryId.value = null
  selectedSubCategoryId.value = null
  moderationStore.fetchAllListings()
}

function openDetailModal(item) {
  activeListing.value = item
  detailModalOpen.value = true
}

async function handleQuickApprove(item) {
  if (isArchivedListingStatus(item.status)) {
    $q.notify({
      type: 'warning',
      icon: 'lock',
      message: 'Arşivdeki (kaldırılan veya reddedilen) ilanlar tekrar onaylanamaz.',
      position: 'top-right'
    })
    return
  }
  try {
    await moderationStore.approveListing(item.id)
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `${item.code} (${item.title}) onaylandı ve yayına alındı.`,
      position: 'top-right'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || 'İlan onaylanırken bir hata oluştu.'
    })
  }
}

async function handleToggleFeature(item) {
  if (isArchivedListingStatus(item.status)) {
    $q.notify({
      type: 'warning',
      icon: 'lock',
      message: 'Arşivdeki (kaldırılan veya reddedilen) ilanlar vitrine eklenemez.',
      position: 'top-right'
    })
    return
  }
  try {
    const isNowFeatured = await moderationStore.toggleFeatureListing(item.id)
    $q.notify({
      type: isNowFeatured ? 'warning' : 'info',
      icon: 'auto_awesome',
      message: isNowFeatured
        ? `${item.code} Ana Sayfa Vitrin listesine eklendi.`
        : `${item.code} vitrinden çıkarıldı.`,
      position: 'top-right'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || 'Vitrin durumu güncellenemedi.'
    })
  }
}

async function handleToggleDoping(item) {
  if (isArchivedListingStatus(item.status)) return
  try {
    const isNowDoping = await moderationStore.toggleDopingListing(item.id)
    $q.notify({
      type: isNowDoping ? 'positive' : 'info',
      icon: 'bolt',
      message: isNowDoping
        ? `${item.code} ilanına 7 günlük Doping tanımlandı.`
        : `${item.code} ilanının dopingi kaldırıldı.`,
      position: 'top-right'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || 'Doping durumu güncellenemedi.'
    })
  }
}

async function handleToggleBoldTitle(item) {
  if (isArchivedListingStatus(item.status)) return
  try {
    const isNowBold = await moderationStore.toggleBoldTitleListing(item.id)
    $q.notify({
      type: isNowBold ? 'positive' : 'info',
      icon: 'format_bold',
      message: isNowBold
        ? `${item.code} ilanına 7 günlük Kalın Yazı tanımlandı.`
        : `${item.code} ilanının kalın yazı özelliği kaldırıldı.`,
      position: 'top-right'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || 'Kalın yazı durumu güncellenemedi.'
    })
  }
}

function openRejectDialog(item) {
  rejectingItem.value = item
  rejectReason.value = moderationStore.rejectionReasons[0]
  rejectNote.value = ''
  rejectDialogOpen.value = true
}

async function confirmReject() {
  if (!rejectingItem.value) return
  try {
    await moderationStore.rejectListing(rejectingItem.value.id, {
      reason: rejectReason.value,
      note: rejectNote.value
    })
    $q.notify({
      type: 'negative',
      icon: 'cancel',
      message: `${rejectingItem.value.code} reddedildi.`,
      position: 'top-right'
    })
    rejectDialogOpen.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'İlan reddedilirken bir hata oluştu.'
    })
  }
}
</script>

<style scoped lang="scss">
.all-listings-page {
  padding: 20px 28px 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.listings-topbar {
  padding: 16px 22px;
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

.total-badge {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 11px;
  border-radius: 999px;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: #64748b;
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
  width: 300px;
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

  &:focus {
    background: #ffffff;
    border-color: #f07419;
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

.refresh-btn {
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #1e293b;
  font-size: 12.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f8fafc;
  }
}

/* Durum Sekmeleri */
.filters-bar {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.status-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.status-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  &--archive {
    border: 1px dashed #cbd5e1;
    background: #f8fafc;
    color: #334155;
  }

  &--active {
    background: #f07419;
    border-color: #f07419;
    color: #ffffff !important;
    box-shadow: 0 3px 10px rgba(240, 116, 25, 0.25);

    .tab-count-chip {
      background: rgba(255, 255, 255, 0.22);
      color: #ffffff;
    }
  }
}

.tab-count-chip {
  background: #e2e8f0;
  color: #334155;
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  line-height: 1.4;
}

.condition-filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cat-cascade-select {
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  min-width: 175px;
  border-radius: 999px;
}

.cond-pill {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;

  &--active {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
  }
}

/* Tablo */
.table-card {
  overflow: hidden;
}

.empty-state {
  padding: 64px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.table-scroll {
  overflow-x: auto;
}

.listings-table {
  width: 100%;
  border-collapse: collapse;

  thead tr {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }

  td {
    padding: 13px 16px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.listing-row {
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: #f8fafc;
  }
}

.row-thumb {
  width: 54px;
  height: 54px;
  border-radius: 9px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.row-thumb-fallback {
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.row-code {
  font-size: 11px;
  font-weight: 800;
  color: #f07419;
}

.row-featured-tag {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
}

.row-doping-tag {
  background: #ffedd5;
  color: #c2410c;
  border: 1px solid #fdba74;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
}

.row-bold-tag {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
}

.row-title--bold-promo {
  font-weight: 900 !important;
  color: #0284c7 !important;
}

.row-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 2px;
}

.row-photo-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.row-category {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
}

.row-brand {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

.row-seller {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
}

.row-location {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

.row-price {
  font-size: 13.5px;
  font-weight: 800;
  color: #dc2626;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;

  &--pending {
    background: #fff7ed;
    color: #ea580c;
    border: 1px solid #fed7aa;
  }

  &--approved {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  &--rejected {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  &--sold {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
  }

  &--passive {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
}

.reject-reason-hint {
  font-size: 10.5px;
  color: #dc2626;
  margin-top: 3px;
  max-width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-date {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.row-rel-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.row-action-btns {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.archived-readonly-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 7px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.tbl-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &--view:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  &--feature:hover,
  &--feature-on {
    background: #fff7ed;
    border-color: #f07419;
    color: #ea580c;
  }

  &--doping:hover,
  &--doping-on {
    background: #ffedd5;
    border-color: #ea580c;
    color: #c2410c;
  }

  &--bold:hover,
  &--bold-on {
    background: #e0f2fe;
    border-color: #0284c7;
    color: #0369a1;
  }

  &--approve {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #16a34a;

    &:hover {
      background: #16a34a;
      color: #ffffff;
    }
  }

  &--reject {
    background: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;

    &:hover {
      background: #dc2626;
      color: #ffffff;
    }
  }
}

/* Detay Modalı */
.modal-no-photos {
  padding: 20px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12.5px;
}

.modal-photos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.modal-photo-box {
  height: 110px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.modal-photo-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 700;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 640px) {
  .modal-photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .modal-info-grid {
    grid-template-columns: 1fr;
  }
}

.modal-info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-info-title {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 4px;
}

.modal-kv {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  color: #475569;

  strong {
    color: #0f172a;
  }
}

.modal-desc-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}
</style>
