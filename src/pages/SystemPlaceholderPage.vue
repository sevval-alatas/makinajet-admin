<template>
  <div class="placeholder-page">
    <header class="placeholder-topbar mj-card">
      <div>
        <h1 class="page-title">{{ pageMeta.title }}</h1>
        <p class="page-subtitle">{{ pageMeta.subtitle }}</p>
      </div>
      <span class="mj-badge-orange">Canlı Veri • V2.4</span>
    </header>

    <!-- Pazaryeri Raporları (/reports -> GET /api/admin/dashboard & /api/admin/categories/listing-counts) -->
    <template v-if="route.path === '/reports'">
      <div class="stats-grid">
        <div class="stat-card mj-card">
          <span class="stat-title">TOPLAM KULLANICI</span>
          <div class="stat-number">{{ dashboard.totalUsers }}</div>
        </div>
        <div class="stat-card mj-card">
          <span class="stat-title">YAYINDAKİ İLANLAR</span>
          <div class="stat-number text-positive">{{ dashboard.approvedListings }}</div>
        </div>
        <div class="stat-card mj-card">
          <span class="stat-title">ONAY BEKLEYEN</span>
          <div class="stat-number text-orange">{{ dashboard.pendingListings }}</div>
        </div>
        <div class="stat-card mj-card">
          <span class="stat-title">AKTİF VİTRİN İLANI</span>
          <div class="stat-number text-primary">{{ dashboard.featuredListings }}</div>
        </div>
        <div class="stat-card mj-card">
          <span class="stat-title">SATILAN TOPLAM KREDİ</span>
          <div class="stat-number">{{ dashboard.totalCreditsSold }}</div>
        </div>
        <div class="stat-card mj-card">
          <span class="stat-title">MAĞAZA İŞLEM ADEDİ</span>
          <div class="stat-number">{{ dashboard.totalStoreTransactions }}</div>
        </div>
      </div>

      <div class="mj-card q-pa-lg">
        <div class="row items-center justify-between q-mb-md q-gutter-y-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold">
              Kategori Bazlı Detaylı İlan Sayıları (`/api/admin/categories/listing-counts`)
            </div>
            <div class="text-caption text-grey-7">
              <template v-if="reportParentCategoryId === null">
                Ana kategoriler listeleniyor. Alt kategorilerini görmek için bir kategori satırına tıklayın.
              </template>
              <template v-else>
                <strong>{{ selectedReportParentCategory?.name }}</strong> kategorisinin alt kategorileri listeleniyor.
              </template>
            </div>
          </div>

          <q-btn
            v-if="reportParentCategoryId !== null"
            outline
            color="dark"
            size="sm"
            no-caps
            icon="arrow_back"
            label="Ana Kategorilere Dön"
            @click="reportParentCategoryId = null"
          />
        </div>

        <div v-if="filteredReportCategories.length === 0" class="text-caption text-grey-6 q-py-md">
          Bu kategoriye ait alt kategori bulunamadı.
        </div>
        <table v-else class="simple-table">
          <thead>
            <tr>
              <th>SIRA</th>
              <th>{{ reportParentCategoryId === null ? 'ANA KATEGORİ ADI (ALT KATEGORİLER İÇİN TIKLAYIN)' : 'ALT KATEGORİ ADI' }}</th>
              <th>DURUM</th>
              <th>TOPLAM İLAN</th>
              <th>YAYINDA</th>
              <th>ONAY BEKLEYEN</th>
              <th>REDDEDİLEN</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cat in filteredReportCategories"
              :key="cat.id"
              class="cursor-pointer"
              title="Alt kategorilerini görmek için tıklayın"
              @click="reportParentCategoryId = Number(cat.id)"
            >
              <td>#{{ cat.order }}</td>
              <td>
                <div class="row items-center q-gutter-x-xs">
                  <span class="text-weight-bold text-primary">
                    {{ cat.name }}
                  </span>
                  <span class="mj-badge-secondhand">
                    {{ cat.subCategoryCount || 0 }} Alt Kategori
                  </span>
                  <q-icon name="chevron_right" size="16px" color="grey-6" />
                </div>
              </td>
              <td>
                <span :class="cat.isActive ? 'mj-badge-green' : 'mj-badge-secondhand'">
                  {{ cat.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td><strong>{{ cat.totalListingCount ?? 0 }}</strong></td>
              <td class="text-positive text-weight-bold">{{ cat.approvedListingCount ?? 0 }}</td>
              <td class="text-orange text-weight-bold">{{ cat.pendingListingCount ?? 0 }}</td>
              <td class="text-negative text-weight-bold">{{ cat.rejectedListingCount ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Ödeme & Faturalar (/payments -> GET /api/admin/transactions) -->
    <template v-else-if="route.path === '/payments'">
      <div class="mj-card q-pa-lg">
        <div class="text-subtitle1 text-weight-bold q-mb-md">
          Apple & Google Mağaza Kredi Satın Alma Hareketleri (`/api/admin/transactions`)
        </div>
        <div v-if="transactions.length === 0" class="text-caption text-grey-6 q-py-md">
          Henüz mağaza satın alma hareketi bulunmuyor veya oturum bekliyor.
        </div>
        <table v-else class="simple-table">
          <thead>
            <tr>
              <th>KULLANICI</th>
              <th>PAKET</th>
              <th>PLATFORM</th>
              <th>KREDİ</th>
              <th>TUTAR</th>
              <th>TARİH</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ tx.userFullName }} ({{ tx.userPhone }})</td>
              <td>{{ tx.packageTitle }}</td>
              <td>{{ tx.platformName }}</td>
              <td>+{{ tx.creditsAdded }} Kredi</td>
              <td>{{ tx.packageDisplayPrice }}</td>
              <td>{{ new Date(tx.verifiedAt).toLocaleString('tr-TR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Kullanıcı & Mağaza Yönetimi (/stores veya /users -> GET /api/admin/stores) -->
    <template v-else-if="route.path === '/users' || route.path === '/stores'">
      <!-- Üst Aylık Mağaza Abonelik Ücreti & Özet Kartları -->
      <div class="store-top-grid">
        <div class="stat-card mj-card">
          <span class="stat-title">TOPLAM MAĞAZA BAŞVURUSU</span>
          <div class="stat-number">{{ stores.length }}</div>
        </div>
        <div class="stat-card mj-card">
          <span class="stat-title">ONAY BEKLEYEN MAĞAZA</span>
          <div class="stat-number text-orange">{{ pendingStoreCount }}</div>
        </div>
        <div class="stat-card mj-card">
          <span class="stat-title">ONAYLI & AKTİF ABONELİK</span>
          <div class="stat-number text-positive">{{ activeSubscribedStoreCount }}</div>
        </div>

        <!-- Aylık Mağaza Ücreti Hızlı Düzenleme Kartı -->
        <div class="stat-card mj-card store-fee-card">
          <div class="row items-center justify-between">
            <span class="stat-title text-primary">AYLIK MAĞAZA ABONELİK ÜCRETİ (SINIRSIZ İLAN)</span>
            <span class="mj-badge-green">30 Gün Sınırsız</span>
          </div>
          <div class="store-fee-inline-row q-mt-sm">
            <div class="store-fee-input-wrap">
              <span class="currency-prefix">₺</span>
              <input
                v-model.number="monthlyFeeInput"
                type="number"
                step="0.01"
                min="0"
                class="store-fee-input"
              />
            </div>
            <q-btn
              unelevated
              color="primary"
              no-caps
              size="sm"
              icon="save"
              label="Ücreti Kaydet"
              :loading="savingFee"
              @click="saveMonthlyFee"
            />
          </div>
        </div>
      </div>

      <!-- Filtre & Arama Çubuğu -->
      <div class="store-filters-bar mj-card">
        <div class="store-status-tabs">
          <button
            v-for="tab in STORE_STATUS_TABS"
            :key="tab.value"
            type="button"
            class="store-tab-btn"
            :class="{ 'store-tab-btn--active': storeFilterStatus === tab.value }"
            @click="changeStoreStatusTab(tab.value)"
          >
            <q-icon :name="tab.icon" size="16px" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div class="store-filter-right">
          <select
            v-model="storeSubscriptionFilter"
            class="mj-input store-sub-select"
            @change="fetchStores"
          >
            <option value="ALL">Tüm Abonelik Durumları</option>
            <option value="true">Aktif Aylık Aboneliği Olanlar</option>
            <option value="false">Aboneliği Olmayan / Süresi Dolanlar</option>
          </select>

          <div class="store-search-wrap">
            <q-icon name="search" size="17px" class="store-search-icon" />
            <input
              v-model="storeSearchQuery"
              type="text"
              placeholder="Mağaza adı, vergi no, doğrulama, tel ara..."
              class="mj-input store-search-input"
              @keyup.enter="fetchStores"
            />
          </div>

          <q-btn
            outline
            color="dark"
            no-caps
            size="sm"
            icon="refresh"
            label="Yenile"
            :loading="loadingStores"
            @click="fetchStores"
          />
        </div>
      </div>

      <!-- Mağaza Başvuruları ve Abonelik Tablosu -->
      <div class="mj-card q-pa-lg">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-subtitle1 text-weight-bold">
              Kurumsal Mağaza Başvuruları, Vergi/Doğrulama ve Aylık Abonelikler (`/api/admin/stores`)
            </div>
            <div class="text-caption text-grey-7">
              Mağaza olarak kayıt olan kullanıcıların vergi numarası veya doğrulama bilgilerini inceleyip onaylayabilir, aylık sınırsız ilan aboneliklerini yönetebilirsiniz.
            </div>
          </div>
        </div>

        <div v-if="loadingStores && stores.length === 0" class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="36px" />
          <div class="text-caption text-grey-7 q-mt-sm">Mağaza listesi yükleniyor...</div>
        </div>

        <div v-else-if="stores.length === 0" class="text-center q-py-xl">
          <q-icon name="storefront" size="44px" color="grey-5" />
          <div class="text-subtitle2 text-grey-8 q-mt-sm">Kayıtlı Mağaza veya Başvuru Bulunamadı</div>
          <div class="text-caption text-grey-6">
            Seçili filtre kriterlerine uygun mağaza kullanıcısı (`UserType = Store`) bulunmuyor.
          </div>
        </div>

        <div v-else style="overflow-x: auto">
          <table class="simple-table">
            <thead>
              <tr>
                <th>MAĞAZA & YETKİLİ</th>
                <th>VERGİ NO / DOĞRULAMA BİLGİSİ</th>
                <th>İLETİŞİM</th>
                <th>ONAY DURUMU</th>
                <th>AYLIK ABONELİK (SINIRSIZ İLAN)</th>
                <th style="text-align: right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="st in stores" :key="st.id || st.userId">
                <td>
                  <div class="text-weight-bold text-dark">
                    {{ st.storeName || st.companyName || 'İsimsiz Mağaza' }}
                  </div>
                  <div class="text-caption text-grey-7">
                    Yetkili: {{ st.fullName || st.name || '-' }} (ID: #{{ st.id || st.userId }})
                  </div>
                </td>

                <td>
                  <div v-if="st.taxNumber">
                    <span class="text-caption text-grey-7">Vergi No: </span>
                    <strong class="text-dark">{{ st.taxNumber }}</strong>
                    <span v-if="st.taxOffice" class="text-caption text-grey-7"> ({{ st.taxOffice }})</span>
                  </div>
                  <div v-if="st.verificationInfo" class="verification-info-pill q-mt-xs">
                    <q-icon name="verified" size="14px" class="q-mr-xs text-primary" />
                    <span>{{ st.verificationInfo }}</span>
                  </div>
                  <div v-if="!st.taxNumber && !st.verificationInfo" class="text-caption text-negative">
                    Doğrulama bilgisi girilmemiş
                  </div>
                </td>

                <td>
                  <div>{{ st.phone || '-' }}</div>
                  <div class="text-caption text-grey-7">{{ st.email || '' }}</div>
                </td>

                <td>
                  <span
                    class="store-status-badge"
                    :class="`store-status-badge--${normalizeStoreStatus(st.storeApprovalStatus).toLowerCase()}`"
                  >
                    {{ formatStoreStatusLabel(st.storeApprovalStatus) }}
                  </span>
                  <div
                    v-if="st.storeRejectReason && normalizeStoreStatus(st.storeApprovalStatus) === 'Rejected'"
                    class="text-caption text-negative q-mt-xs"
                  >
                    Ret: {{ st.storeRejectReason }}
                  </div>
                </td>

                <td>
                  <div v-if="isSubscriptionActive(st)">
                    <span class="mj-badge-green">Aktif (Sınırsız İlan)</span>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      Bitiş: {{ formatDate(st.storeSubscriptionExpiresAt) }}
                    </div>
                  </div>
                  <div v-else>
                    <span class="mj-badge-secondhand">Abonelik Yok / Süresi Dolmuş</span>
                    <div v-if="st.storeSubscriptionExpiresAt" class="text-caption text-grey-6 q-mt-xs">
                      Son: {{ formatDate(st.storeSubscriptionExpiresAt) }}
                    </div>
                  </div>
                </td>

                <td style="text-align: right">
                  <div class="row items-center justify-end q-gutter-xs no-wrap">
                    <q-btn
                      v-if="normalizeStoreStatus(st.storeApprovalStatus) !== 'Approved'"
                      unelevated
                      color="positive"
                      size="sm"
                      no-caps
                      icon="check_circle"
                      label="Onayla"
                      @click="openApproveStoreModal(st)"
                    />

                    <q-btn
                      v-if="normalizeStoreStatus(st.storeApprovalStatus) !== 'Rejected'"
                      outline
                      color="negative"
                      size="sm"
                      no-caps
                      icon="cancel"
                      label="Reddet"
                      @click="openRejectStoreModal(st)"
                    />

                    <q-btn
                      outline
                      color="primary"
                      size="sm"
                      no-caps
                      icon="event_repeat"
                      label="Abonelik Süresi"
                      @click="openSubscriptionModal(st)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mağaza Onaylama Modalı (PATCH /api/admin/stores/{id}/approve) -->
      <q-dialog v-model="approveModalOpen">
        <q-card style="width: 460px; max-width: 95vw; border-radius: 14px">
          <q-card-section class="row items-center justify-between border-bottom">
            <div class="text-subtitle1 text-weight-bold text-positive">
              Mağaza Başvurusunu Onayla
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-gutter-y-md" v-if="selectedStore">
            <div class="q-pa-sm bg-grey-2 rounded-borders text-caption">
              <div><strong>Mağaza:</strong> {{ selectedStore.storeName || selectedStore.fullName }}</div>
              <div><strong>Vergi No:</strong> {{ selectedStore.taxNumber || '-' }} {{ selectedStore.taxOffice ? `(${selectedStore.taxOffice})` : '' }}</div>
              <div><strong>Doğrulama Bilgisi:</strong> {{ selectedStore.verificationInfo || '-' }}</div>
            </div>

            <div>
              <label class="text-caption text-weight-bold text-dark">
                Onay Anında Hediye / Başlangıç Abonelik Süresi (`grantSubscriptionMonths`)
              </label>
              <select v-model.number="grantMonthsOnApprove" class="mj-input q-mt-xs">
                <option :value="0">0 Ay (Mağaza kendisi aylık ödeme yapsın)</option>
                <option :value="1">1 Ay (30 Gün Sınırsız İlan Tanımla)</option>
                <option :value="3">3 Ay (90 Gün Sınırsız İlan Tanımla)</option>
                <option :value="6">6 Ay (180 Gün Sınırsız İlan Tanımla)</option>
                <option :value="12">12 Ay (1 Yıl Sınırsız İlan Tanımla)</option>
              </select>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Vazgeç" color="grey-7" no-caps v-close-popup />
            <q-btn
              unelevated
              color="positive"
              no-caps
              icon="check_circle"
              label="Mağazayı Onayla"
              :loading="submittingStoreAction"
              @click="confirmApproveStore"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Mağaza Reddetme Modalı (PATCH /api/admin/stores/{id}/reject) -->
      <q-dialog v-model="rejectModalOpen">
        <q-card style="width: 460px; max-width: 95vw; border-radius: 14px">
          <q-card-section class="row items-center justify-between border-bottom">
            <div class="text-subtitle1 text-weight-bold text-negative">
              Mağaza Başvurusunu Reddet
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-gutter-y-md" v-if="selectedStore">
            <div class="text-caption text-grey-7">
              <strong>{{ selectedStore.storeName || selectedStore.fullName }}</strong> mağazasının başvurusunu reddetme nedeninizi belirtin. Kullanıcı vergi numarası veya doğrulama bilgisini güncelleyip tekrar başvurabilir.
            </div>

            <div>
              <label class="text-caption text-weight-bold text-dark">Reddetme Sebebi (`rejectReason`)</label>
              <textarea
                v-model="rejectStoreReason"
                rows="3"
                class="mj-input q-mt-xs"
                placeholder="Örn: Vergi numarası doğrulanamadı, lütfen vergi levhası veya ticaret sicil bilginizi eksiksiz girin."
              ></textarea>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Vazgeç" color="grey-7" no-caps v-close-popup />
            <q-btn
              unelevated
              color="negative"
              no-caps
              icon="cancel"
              label="Başvuruyu Reddet"
              :loading="submittingStoreAction"
              @click="confirmRejectStore"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Mağaza Manuel Abonelik Süresi Tanımlama Modalı (PATCH /api/admin/stores/{id}/subscription) -->
      <q-dialog v-model="subscriptionModalOpen">
        <q-card style="width: 460px; max-width: 95vw; border-radius: 14px">
          <q-card-section class="row items-center justify-between border-bottom">
            <div class="text-subtitle1 text-weight-bold text-primary">
              Aylık Mağaza Aboneliği Yönetimi
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-gutter-y-md" v-if="selectedStore">
            <div class="q-pa-sm bg-grey-2 rounded-borders text-caption">
              <div><strong>Mağaza:</strong> {{ selectedStore.storeName || selectedStore.fullName }}</div>
              <div>
                <strong>Mevcut Abonelik Bitiş:</strong>
                {{ formatDate(selectedStore.storeSubscriptionExpiresAt) || 'Aktif abonelik yok' }}
              </div>
            </div>

            <div>
              <label class="text-caption text-weight-bold text-dark">
                Eklenecek / Tanımlanacak Süre (`durationMonths`)
              </label>
              <select v-model.number="subscriptionDurationMonths" class="mj-input q-mt-xs">
                <option :value="1">+1 Ay (30 Gün Sınırsız İlan Uzat/Başlat)</option>
                <option :value="2">+2 Ay (60 Gün Sınırsız İlan)</option>
                <option :value="3">+3 Ay (90 Gün Sınırsız İlan)</option>
                <option :value="6">+6 Ay (180 Gün Sınırsız İlan)</option>
                <option :value="12">+12 Ay (1 Yıl Sınırsız İlan)</option>
                <option :value="0">0 (Aboneliği Sonlandır / İptal Et)</option>
              </select>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Vazgeç" color="grey-7" no-caps v-close-popup />
            <q-btn
              unelevated
              color="primary"
              no-caps
              icon="save"
              label="Aboneliği Güncelle"
              :loading="submittingStoreAction"
              @click="confirmUpdateSubscription"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>

    <!-- Genel Görünüm -->
    <div v-else class="placeholder-content mj-card">
      <div class="placeholder-icon-ring">
        <q-icon :name="pageMeta.icon" size="38px" color="primary" />
      </div>

      <h2 class="placeholder-heading">{{ pageMeta.title }} Modülü</h2>
      <p class="placeholder-desc">
        {{ pageMeta.description }}
      </p>

      <div class="row q-gutter-sm justify-center q-mt-md">
        <q-btn
          unelevated
          color="primary"
          no-caps
          icon="fact_check"
          label="İlan Moderasyonuna Dön"
          to="/moderation"
        />
        <q-btn
          outline
          color="dark"
          no-caps
          icon="tune"
          label="Kategori & Kredi Ayarları"
          to="/settings"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { apiClient } from '@/services/api'
import { useSettingsStore } from '@/stores/settingsStore'

const route = useRoute()
const $q = useQuasar()
const settingsStore = useSettingsStore()

const STORE_STATUS_TABS = [
  { value: 'ALL', label: 'Tüm Mağazalar', icon: 'storefront' },
  { value: 'Pending', label: 'Onay Bekleyenler', icon: 'hourglass_top' },
  { value: 'Approved', label: 'Onaylananlar', icon: 'verified' },
  { value: 'Rejected', label: 'Reddedilenler', icon: 'cancel' }
]

const dashboard = ref({
  totalUsers: 0,
  approvedListings: 0,
  pendingListings: 0,
  rejectedListings: 0,
  featuredListings: 0,
  totalCreditsSold: 0,
  totalStoreTransactions: 0
})

const transactions = ref([])
const categoryCounts = ref([])
const reportParentCategoryId = ref(null)

const selectedReportParentCategory = computed(() => {
  if (reportParentCategoryId.value === null) return null
  return (
    categoryCounts.value.find(
      (c) => Number(c.id) === Number(reportParentCategoryId.value)
    ) || null
  )
})

const filteredReportCategories = computed(() => {
  if (reportParentCategoryId.value === null) {
    return categoryCounts.value.filter((c) => !c.parentId)
  }
  return categoryCounts.value.filter(
    (c) => Number(c.parentId) === Number(reportParentCategoryId.value)
  )
})

// Mağaza Yönetimi (/users) State
const stores = ref([])
const loadingStores = ref(false)
const storeFilterStatus = ref('ALL')
const storeSubscriptionFilter = ref('ALL')
const storeSearchQuery = ref('')

const monthlyFeeInput = ref(1499.90)
const savingFee = ref(false)

const selectedStore = ref(null)
const approveModalOpen = ref(false)
const rejectModalOpen = ref(false)
const subscriptionModalOpen = ref(false)
const grantMonthsOnApprove = ref(0)
const rejectStoreReason = ref('')
const subscriptionDurationMonths = ref(1)
const submittingStoreAction = ref(false)

const pendingStoreCount = computed(() => {
  return stores.value.filter(
    (s) => normalizeStoreStatus(s.storeApprovalStatus) === 'Pending'
  ).length
})

const activeSubscribedStoreCount = computed(() => {
  return stores.value.filter((s) => isSubscriptionActive(s)).length
})

function normalizeStoreStatus(status) {
  if (status === 1 || String(status).toLowerCase() === 'pending') return 'Pending'
  if (status === 2 || String(status).toLowerCase() === 'approved') return 'Approved'
  if (status === 3 || String(status).toLowerCase() === 'rejected') return 'Rejected'
  return 'Pending'
}

function formatStoreStatusLabel(status) {
  const norm = normalizeStoreStatus(status)
  if (norm === 'Approved') return 'Onaylandı'
  if (norm === 'Rejected') return 'Reddedildi'
  return 'Onay Bekliyor'
}

function isSubscriptionActive(st) {
  if (st.hasActiveSubscription === true) return true
  if (!st.storeSubscriptionExpiresAt) return false
  return new Date(st.storeSubscriptionExpiresAt).getTime() > Date.now()
}

function formatDate(dateVal) {
  if (!dateVal) return ''
  const d = new Date(dateVal)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchStores() {
  loadingStores.value = true
  try {
    const params = {}
    if (storeFilterStatus.value !== 'ALL') {
      params.status = storeFilterStatus.value
    }
    if (storeSubscriptionFilter.value !== 'ALL') {
      params.hasActiveSubscription = storeSubscriptionFilter.value === 'true'
    }
    if (storeSearchQuery.value.trim()) {
      params.search = storeSearchQuery.value.trim()
    }

    const res = await apiClient.get('/admin/stores', { params })
    const raw = res.data?.items || res.data?.data || res.data
    stores.value = Array.isArray(raw) ? raw : []
  } catch {
    stores.value = []
  } finally {
    loadingStores.value = false
  }
}

function changeStoreStatusTab(val) {
  storeFilterStatus.value = val
  fetchStores()
}

async function saveMonthlyFee() {
  savingFee.value = true
  try {
    const updated = await settingsStore.updateStoreMonthlyFee(monthlyFeeInput.value)
    monthlyFeeInput.value = updated
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `Aylık mağaza abonelik ücreti ₺${Number(updated).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} olarak kaydedildi!`,
      position: 'top-right'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || err.message || 'Ücret güncellenemedi.'
    })
  } finally {
    savingFee.value = false
  }
}

function openApproveStoreModal(storeItem) {
  selectedStore.value = storeItem
  grantMonthsOnApprove.value = 0
  approveModalOpen.value = true
}

async function confirmApproveStore() {
  if (!selectedStore.value) return
  const storeId = selectedStore.value.id || selectedStore.value.userId
  submittingStoreAction.value = true
  try {
    await apiClient.patch(`/admin/stores/${storeId}/approve`, {
      grantSubscriptionMonths: Number(grantMonthsOnApprove.value) || 0
    })
    $q.notify({
      type: 'positive',
      icon: 'verified',
      message: `${selectedStore.value.storeName || selectedStore.value.fullName} mağaza başvurusu onaylandı!`,
      position: 'top-right'
    })
    approveModalOpen.value = false
    await fetchStores()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Mağaza onaylanırken bir hata oluştu.'
    })
  } finally {
    submittingStoreAction.value = false
  }
}

function openRejectStoreModal(storeItem) {
  selectedStore.value = storeItem
  rejectStoreReason.value = storeItem.storeRejectReason || ''
  rejectModalOpen.value = true
}

async function confirmRejectStore() {
  if (!selectedStore.value) return
  if (!rejectStoreReason.value.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Lütfen mağaza reddetme sebebini yazın.'
    })
    return
  }
  const storeId = selectedStore.value.id || selectedStore.value.userId
  submittingStoreAction.value = true
  try {
    await apiClient.patch(`/admin/stores/${storeId}/reject`, {
      rejectReason: rejectStoreReason.value.trim()
    })
    $q.notify({
      type: 'negative',
      icon: 'cancel',
      message: `${selectedStore.value.storeName || selectedStore.value.fullName} mağaza başvurusu reddedildi.`,
      position: 'top-right'
    })
    rejectModalOpen.value = false
    await fetchStores()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Mağaza reddedilirken bir hata oluştu.'
    })
  } finally {
    submittingStoreAction.value = false
  }
}

function openSubscriptionModal(storeItem) {
  selectedStore.value = storeItem
  subscriptionDurationMonths.value = 1
  subscriptionModalOpen.value = true
}

async function confirmUpdateSubscription() {
  if (!selectedStore.value) return
  const storeId = selectedStore.value.id || selectedStore.value.userId
  submittingStoreAction.value = true
  try {
    await apiClient.patch(`/admin/stores/${storeId}/subscription`, {
      durationMonths: Number(subscriptionDurationMonths.value)
    })
    $q.notify({
      type: 'positive',
      icon: 'event_repeat',
      message:
        subscriptionDurationMonths.value === 0
          ? 'Mağaza aylık aboneliği sonlandırıldı.'
          : `Mağaza aboneliği ${subscriptionDurationMonths.value} ay tanımlandı/uzatıldı!`,
      position: 'top-right'
    })
    subscriptionModalOpen.value = false
    await fetchStores()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Abonelik süresi güncellenemedi.'
    })
  } finally {
    submittingStoreAction.value = false
  }
}

async function loadEndpointData() {
  if (route.path === '/users' || route.path === '/stores') {
    await settingsStore.fetchSettings()
    monthlyFeeInput.value = settingsStore.credits.storeMonthlySubscriptionFee
    await fetchStores()
  } else if (route.path === '/reports') {
    try {
      const res = await apiClient.get('/admin/dashboard')
      if (res.data) {
        dashboard.value = res.data
      }
    } catch {
      // Varsayılan özet metrikleri göster
    }

    try {
      const countRes = await apiClient.get('/admin/categories/listing-counts')
      const list = countRes.data?.data || countRes.data
      if (Array.isArray(list)) {
        categoryCounts.value = settingsStore.normalizeCategoriesResponse(list)
      }
    } catch {
      // ignore
    }
  } else if (route.path === '/payments') {
    try {
      const res = await apiClient.get('/admin/transactions')
      if (res.data?.items) {
        transactions.value = res.data.items
      }
    } catch {
      // ignore
    }
  }
}

onMounted(loadEndpointData)
watch(() => route.path, loadEndpointData)

const pageMeta = computed(() => {
  if (route.path === '/stores' || route.path === '/users') {
    return {
      title: 'Mağaza Onayları & Abonelik Yönetimi',
      subtitle: 'Kurumsal mağaza başvurularını (vergi no / doğrulama bilgisi), onay durumlarını ve aylık sınırsız ilan aboneliklerini yönetin',
      icon: 'storefront',
      description:
        'Bu ekrandan mağaza olarak başvuran satıcıların vergi numarası/doğrulama bilgilerini onaylayabilir ve aylık mağaza aboneliklerini yönetebilirsiniz.'
    }
  }
  if (route.path === '/payments') {
    return {
      title: 'Ödeme & Faturalar',
      subtitle: 'Apple & Google mağaza kredi paketi satışları ve işlem hareketleri',
      icon: 'receipt_long',
      description:
        'Kullanıcıların satın aldığı vitrin ve ilan kredi paketlerinin ödeme geçmişi burada listelenir.'
    }
  }
  return {
    title: 'Pazaryeri Raporları',
    subtitle: 'Genel pazaryeri metrikleri, onay bekleyen ilanlar ve kredi satış özetleri',
    icon: 'analytics',
    description:
      'MakinaJet pazaryerindeki aktif ilanların kategori dağılımı ve gelir metrikleri bu ekranda raporlanır.'
  }
})
</script>

<style scoped lang="scss">
.placeholder-page {
  padding: 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.placeholder-topbar {
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.store-top-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) 1.5fr;
  gap: 16px;
}

@media (max-width: 1180px) {
  .store-top-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.store-fee-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  border: 1.5px solid #0284c7;
}

.store-fee-inline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.store-fee-input-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #0284c7;
  border-radius: 9px;
  padding: 0 10px;
  height: 36px;
}

.currency-prefix {
  font-size: 14px;
  font-weight: 800;
  color: #0369a1;
  margin-right: 4px;
}

.store-fee-input {
  width: 105px;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  background: transparent;
}

.store-filters-bar {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.store-status-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.store-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 13px;
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

  &--active {
    background: #f07419;
    color: #ffffff;
    box-shadow: 0 3px 10px rgba(240, 116, 25, 0.25);
  }
}

.store-filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.store-sub-select {
  width: 225px;
  height: 36px;
  font-size: 12px;
}

.store-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 260px;
}

.store-search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
}

.store-search-input {
  width: 100%;
  height: 36px;
  padding-left: 32px !important;
  font-size: 12px;
}

.verification-info-pill {
  display: inline-flex;
  align-items: center;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
}

.store-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;

  &--pending {
    background: #fff7ed;
    color: #c2410c;
    border: 1px solid #fed7aa;
  }

  &--approved {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  &--rejected {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }
}

.stat-card {
  padding: 20px 22px;
}

.stat-title {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 6px;
}

.text-orange {
  color: #f07419;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 10px 12px;
    font-size: 11px;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 12px;
    font-size: 13px;
    border-bottom: 1px solid #f1f5f9;
  }
}

.placeholder-content {
  padding: 64px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder-icon-ring {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.placeholder-heading {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.placeholder-desc {
  margin: 0;
  max-width: 480px;
  font-size: 13.5px;
  color: #64748b;
  line-height: 1.6;
}
</style>
