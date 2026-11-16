<template>
  <div class="settings-page">
    <!-- Üst Başlık Çubuğu -->
    <header class="settings-topbar">
      <div>
        <h1 class="page-title">Kategori, Banner ve Sistem Parametreleri</h1>
        <p class="page-subtitle">
          Mobil uygulamanın canlı içeriğini ve vitrin maliyetlerini yönetin
        </p>
      </div>

      <button
        type="button"
        class="publish-btn"
        :disabled="settingsStore.saving"
        @click="handlePublishChanges"
      >
        <q-spinner-dots v-if="settingsStore.saving" color="white" size="18px" />
        <template v-else>
          <q-icon name="save" size="18px" />
          <span>Değişiklikleri Yayınla</span>
        </template>
      </button>
    </header>

    <!-- BÖLÜM 1: Ana Sayfa Hero Banner & WhatsApp Destek Hattı -->
    <section class="settings-card mj-card">
      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon-box">
            <q-icon name="ad_units" size="20px" />
          </div>
          <div>
            <h2 class="section-title">Ana Sayfa Hero Banner & WhatsApp Destek Hattı</h2>
            <p class="section-desc">
              Uygulama ana ekranındaki üst tanıtım panosunu ve canlı destek hattını güncelleyin
            </p>
          </div>
        </div>

        <span class="mj-badge-green">Canlıda Aktif</span>
      </div>

      <div class="banner-grid">
        <!-- Sol Form Alanı -->
        <div class="banner-form">
          <div class="form-group">
            <label class="form-label">Banner Ana Başlık</label>
            <input
              v-model="settingsStore.banner.title"
              type="text"
              class="mj-input form-input-bold"
              placeholder="Tekstil Makinelerinizi Hızlıca Alın, Satın!"
            />
          </div>

          <div class="bullets-row">
            <div class="form-group">
              <label class="form-label form-label--muted">Madde 1 (Tik)</label>
              <input
                v-model="settingsStore.banner.bullet1"
                type="text"
                class="mj-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label form-label--muted">Madde 2 (Tik)</label>
              <input
                v-model="settingsStore.banner.bullet2"
                type="text"
                class="mj-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label form-label--muted">Madde 3 (Tik)</label>
              <input
                v-model="settingsStore.banner.bullet3"
                type="text"
                class="mj-input"
              />
            </div>
          </div>

          <div class="whatsapp-row">
            <div class="form-group">
              <label class="form-label">
                <span class="wa-badge-icon">💬</span>
                WhatsApp Destek Numarası
              </label>
              <input
                v-model="settingsStore.banner.whatsappNumber"
                type="text"
                class="mj-input form-input-bold"
                placeholder="+90 532 000 00 00"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Otomatik Mesaj Şablonu</label>
              <input
                v-model="settingsStore.banner.whatsappTemplate"
                type="text"
                class="mj-input text-grey-8"
                placeholder="Merhaba MakinaJet, sanayi dikiş makinesi..."
              />
            </div>
          </div>
        </div>

        <!-- Sağ Mobil Canlı Önizleme Kartı -->
        <div class="mobile-preview-shell">
          <div class="preview-caption">MOBİL CANLI ÖNİZLEME</div>

          <div class="hero-preview-card">
            <div class="hero-preview-content">
              <div class="hero-preview-tag">
                {{ settingsStore.banner.badgeText || 'PAZARYERİ PANOSU' }}
              </div>
              <div class="hero-preview-title">
                {{ settingsStore.banner.title || 'Tekstil Makinelerinizi Hızlıca Alın, Satın!' }}
              </div>
              <ul class="hero-preview-bullets">
                <li v-if="settingsStore.banner.bullet1">
                  ✓ {{ settingsStore.banner.bullet1 }}
                </li>
                <li v-if="settingsStore.banner.bullet2">
                  ✓ {{ settingsStore.banner.bullet2 }}
                </li>
              </ul>
            </div>

            <div class="hero-preview-visual">
              <img
                v-if="settingsStore.banner.bannerImageUrl"
                :src="settingsStore.banner.bannerImageUrl"
                alt="Banner Görseli"
              />
              <q-icon
                v-else
                name="precision_manufacturing"
                size="26px"
                color="blue-grey-4"
              />
            </div>
          </div>

          <div class="preview-footer">
            <button
              type="button"
              class="change-image-link"
              @click="showBannerImageDialog = true"
            >
              Görseli Değiştir
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- BÖLÜM 2: Kategori Yönetimi ve Sıralama -->
    <section class="settings-card mj-card">
      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon-box">
            <q-icon name="category" size="20px" />
          </div>
          <div>
            <h2 class="section-title">Kategori Yönetimi ve Sıralama</h2>
            <p class="section-desc">
              Ana sayfadaki {{ settingsStore.categories.length }} yatay kategori kartının sırasını, durumunu ve ikonlarını düzenleyin
            </p>
          </div>
        </div>

        <button
          type="button"
          class="add-category-btn"
          @click="openCategoryModal()"
        >
          <q-icon name="add" size="17px" />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      <div class="categories-table-wrap">
        <table class="categories-table">
          <thead>
            <tr>
              <th style="width: 64px">SIRA</th>
              <th style="width: 74px">İKON</th>
              <th>KATEGORİ ADI</th>
              <th style="width: 180px">İLAN SAYISI</th>
              <th style="width: 140px">DURUM</th>
              <th style="width: 110px; text-align: right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(cat, idx) in settingsStore.categories"
              :key="cat.id"
              draggable="true"
              class="cat-row"
              :class="{ 'cat-row--dragging': draggedIndex === idx }"
              @dragstart="onDragStart(idx)"
              @dragover.prevent
              @drop="onDrop(idx)"
              @dragend="draggedIndex = null"
            >
              <td>
                <div class="drag-handle-cell" title="Sıralamak için sürükleyin">
                  <q-icon name="drag_indicator" size="18px" class="drag-icon" />
                </div>
              </td>

              <td>
                <CategoryIcon :type="cat.iconType" :color="cat.iconColor" />
              </td>

              <td>
                <span class="cat-name">{{ cat.name }}</span>
              </td>

              <td>
                <span class="cat-count">{{ cat.listingCount }} İlan</span>
              </td>

              <td>
                <button
                  type="button"
                  class="status-toggle-pill"
                  :class="cat.isActive ? 'status-toggle-pill--active' : 'status-toggle-pill--passive'"
                  @click="toggleCategoryStatus(cat)"
                >
                  {{ cat.isActive ? 'Aktif' : 'Pasif' }}
                </button>
              </td>

              <td style="text-align: right">
                <div class="row-actions">
                  <button
                    type="button"
                    class="icon-action-btn"
                    title="Yukarı Taşı"
                    :disabled="idx === 0"
                    @click="settingsStore.moveCategory(idx, idx - 1)"
                  >
                    <q-icon name="keyboard_arrow_up" size="17px" />
                  </button>
                  <button
                    type="button"
                    class="icon-action-btn"
                    title="Aşağı Taşı"
                    :disabled="idx === settingsStore.categories.length - 1"
                    @click="settingsStore.moveCategory(idx, idx + 1)"
                  >
                    <q-icon name="keyboard_arrow_down" size="17px" />
                  </button>
                  <button
                    type="button"
                    class="icon-action-btn"
                    title="Kategoriyi Düzenle"
                    @click="openCategoryModal(cat)"
                  >
                    <q-icon name="edit" size="16px" />
                  </button>
                  <button
                    type="button"
                    class="icon-action-btn icon-action-btn--delete"
                    title="Kategoriyi Sil"
                    @click="confirmDeleteCategory(cat)"
                  >
                    <q-icon name="delete_outline" size="17px" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- BÖLÜM 3: İlan ve Vitrin Kredi Maliyetleri (Monetizasyon) -->
    <section ref="creditsSectionRef" class="settings-card mj-card">
      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon-box">
            <q-icon name="payments" size="20px" />
          </div>
          <div>
            <h2 class="section-title">İlan ve Vitrin Kredi Maliyetleri (Monetizasyon)</h2>
            <p class="section-desc">
              Kullanıcıların yeni ilan açma, acil etiketleme ve ana sayfa vitrin öne çıkarma maliyetlerini belirleyin
            </p>
          </div>
        </div>

        <div class="instant-active-tag">
          <q-icon name="bolt" size="16px" />
          <span>Anında Geçerli</span>
        </div>
      </div>

      <div class="credits-cards-grid">
        <!-- Kart 1: Standart İlan Yayınlama -->
        <div class="credit-box">
          <div class="credit-box-label">STANDART İLAN YAYINLAMA</div>
          <div class="credit-input-row">
            <input
              v-model.number="settingsStore.credits.standardListingCredits"
              type="number"
              min="0"
              class="credit-number-input"
            />
            <span class="credit-unit-text">Kredi / İlan</span>
          </div>
          <p class="credit-box-note">
            İlk 1 ilan tüm yeni kullanıcılara hediye edilir.
          </p>
        </div>

        <!-- Kart 2: Ana Sayfa Vitrin (7 Gün) - Vurgulu -->
        <div class="credit-box credit-box--highlighted">
          <div class="credit-box-label credit-box-label--orange">
            ANA SAYFA VİTRİN (7 GÜN)
          </div>
          <div class="credit-input-row">
            <input
              v-model.number="settingsStore.credits.showcase7DaysCredits"
              type="number"
              min="1"
              class="credit-number-input credit-number-input--orange"
            />
            <span class="credit-unit-text credit-unit-text--orange">
              Kredi (veya ₺{{ settingsStore.showcasePriceTl }})
            </span>
          </div>
          <p class="credit-box-note">
            Öne çıkanlar bloğunda en üst 4 sırada görünür.
          </p>
        </div>

        <!-- Kart 3: Acil Satılık Rozeti -->
        <div class="credit-box">
          <div class="credit-box-label">ACİL SATILIK ROZETİ</div>
          <div class="credit-input-row">
            <input
              v-model.number="settingsStore.credits.urgentBadgeCredits"
              type="number"
              min="1"
              class="credit-number-input"
            />
            <span class="credit-unit-text">Kredi</span>
          </div>
          <p class="credit-box-note">
            Kırmızı dikkat çekici etiket ile listelenir.
          </p>
        </div>

        <!-- Kart 4: 1 Kredi Birim Fiyatı -->
        <div class="credit-box">
          <div class="credit-box-label">1 KREDİ BİRİM FİYATI</div>
          <div class="credit-input-row">
            <input
              v-model.number="settingsStore.credits.creditUnitPriceTl"
              type="number"
              min="1"
              class="credit-number-input"
            />
            <span class="credit-unit-text">TL + KDV</span>
          </div>
          <p class="credit-box-note">
            Kredi paketlerinde toplu alım indirimi uygulanır.
          </p>
        </div>
      </div>
    </section>

    <!-- Kategori Ekle / Düzenle Modalı -->
    <q-dialog v-model="categoryModalOpen">
      <q-card style="min-width: 420px; border-radius: 14px">
        <q-card-section class="row items-center justify-between border-bottom">
          <div class="text-subtitle1 text-weight-bold">
            {{ editingCategoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <div>
            <label class="form-label">Kategori Adı</label>
            <input
              v-model="categoryForm.name"
              type="text"
              class="mj-input"
              placeholder="Örn: Ütü & Buhar Kazanları"
            />
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <label class="form-label">İkon Tipi</label>
              <select v-model="categoryForm.iconType" class="mj-input">
                <option value="sewing">Dikiş Makinesi</option>
                <option value="overlock">Overlok</option>
                <option value="coverstitch">Reçme</option>
                <option value="buttonhole">İlik-Düğme</option>
                <option value="cutting">Kesim Sistemi</option>
                <option value="spareparts">Yedek Parça / Dişli</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label">İkon Rengi</label>
              <select v-model="categoryForm.iconColor" class="mj-input">
                <option value="#ea580c">Turuncu (#ea580c)</option>
                <option value="#0284c7">Mavi (#0284c7)</option>
                <option value="#16a34a">Yeşil (#16a34a)</option>
                <option value="#0f172a">Koyu Lacivert (#0f172a)</option>
              </select>
            </div>
          </div>

          <div class="row items-center justify-between">
            <span class="form-label q-mb-none">Kategori Durumu (Mobil Görünürlük)</span>
            <q-toggle v-model="categoryForm.isActive" color="positive" label="Aktif" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Vazgeç" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            color="primary"
            :label="editingCategoryId ? 'Güncelle' : 'Kategoriyi Ekle'"
            no-caps
            @click="saveCategoryForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Banner Görseli Değiştirme Modalı -->
    <q-dialog v-model="showBannerImageDialog">
      <q-card style="min-width: 420px; border-radius: 14px">
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">Hero Banner Görselini Güncelle</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <div>
            <label class="form-label">Görsel URL veya Veri Bağlantısı</label>
            <input
              v-model="settingsStore.banner.bannerImageUrl"
              type="text"
              class="mj-input"
              placeholder="https://... (Boş bırakılırsa varsayılan ikon kullanılır)"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            label="Varsayılana Dön"
            color="grey-7"
            no-caps
            @click="settingsStore.banner.bannerImageUrl = ''"
          />
          <q-btn unelevated color="primary" label="Tamam" no-caps v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { useSettingsStore } from '@/stores/settingsStore'

const route = useRoute()
const $q = useQuasar()
const settingsStore = useSettingsStore()

const creditsSectionRef = ref(null)
const draggedIndex = ref(null)

// Kategori Ekle/Düzenle Modal state
const categoryModalOpen = ref(false)
const editingCategoryId = ref(null)
const categoryForm = reactive({
  name: '',
  iconType: 'sewing',
  iconColor: '#ea580c',
  listingCount: 0,
  isActive: true
})

const showBannerImageDialog = ref(false)

onMounted(() => {
  settingsStore.fetchSettings()
  checkScrollToSection(route.query.section)
})

watch(
  () => route.query.section,
  (sec) => {
    checkScrollToSection(sec)
  }
)

function checkScrollToSection(section) {
  if (section === 'credits') {
    nextTick(() => {
      creditsSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

async function handlePublishChanges() {
  await settingsStore.publishAllSettings()
  $q.notify({
    type: 'positive',
    icon: 'cloud_done',
    message: 'Kategori, Hero Banner ve Kredi parametreleri canlıya yayınlandı!',
    position: 'top-right',
    timeout: 2500
  })
}

function onDragStart(idx) {
  draggedIndex.value = idx
}

function onDrop(targetIdx) {
  if (draggedIndex.value === null || draggedIndex.value === targetIdx) return
  settingsStore.moveCategory(draggedIndex.value, targetIdx)
  draggedIndex.value = null
  $q.notify({
    type: 'info',
    message: 'Kategori sıralaması güncellendi.',
    position: 'bottom-right',
    timeout: 1200
  })
}

function toggleCategoryStatus(cat) {
  settingsStore.updateCategory(cat.id, { isActive: !cat.isActive })
}

function openCategoryModal(cat = null) {
  if (cat) {
    editingCategoryId.value = cat.id
    categoryForm.name = cat.name
    categoryForm.iconType = cat.iconType
    categoryForm.iconColor = cat.iconColor
    categoryForm.listingCount = cat.listingCount
    categoryForm.isActive = cat.isActive
  } else {
    editingCategoryId.value = null
    categoryForm.name = ''
    categoryForm.iconType = 'sewing'
    categoryForm.iconColor = '#ea580c'
    categoryForm.listingCount = 0
    categoryForm.isActive = true
  }
  categoryModalOpen.value = true
}

function saveCategoryForm() {
  if (!categoryForm.name.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Lütfen kategori adını girin.'
    })
    return
  }

  if (editingCategoryId.value) {
    settingsStore.updateCategory(editingCategoryId.value, {
      name: categoryForm.name.trim(),
      iconType: categoryForm.iconType,
      iconColor: categoryForm.iconColor,
      isActive: categoryForm.isActive
    })
    $q.notify({
      type: 'positive',
      message: `"${categoryForm.name}" kategorisi güncellendi.`,
      position: 'top-right'
    })
  } else {
    settingsStore.addCategory({
      name: categoryForm.name.trim(),
      iconType: categoryForm.iconType,
      iconColor: categoryForm.iconColor,
      listingCount: 0,
      isActive: categoryForm.isActive
    })
    $q.notify({
      type: 'positive',
      message: `"${categoryForm.name}" kategorisi eklendi.`,
      position: 'top-right'
    })
  }

  categoryModalOpen.value = false
}

function confirmDeleteCategory(cat) {
  $q.dialog({
    title: 'Kategoriyi Sil',
    message: `"${cat.name}" kategorisini silmek istediğinize emin misiniz?`,
    cancel: { label: 'Vazgeç', flat: true, noCaps: true },
    ok: { label: 'Sil', color: 'negative', unelevated: true, noCaps: true },
    persistent: true
  }).onOk(() => {
    settingsStore.deleteCategory(cat.id)
    $q.notify({
      type: 'info',
      message: `"${cat.name}" silindi.`,
      position: 'top-right'
    })
  })
}
</script>

<style scoped lang="scss">
.settings-page {
  padding: 22px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.settings-topbar {
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
  letter-spacing: -0.3px;
}

.page-subtitle {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: #64748b;
}

.publish-btn {
  height: 42px;
  padding: 0 20px;
  background: #f07419;
  color: #ffffff;
  border: none;
  border-radius: 10px;
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
}

.settings-card {
  padding: 22px 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #fff7ed;
  color: #f07419;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.section-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* Bölüm 1: Banner & WhatsApp */
.banner-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1100px) {
  .banner-grid {
    grid-template-columns: 1fr;
  }
}

.banner-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 5px;

  &--muted {
    color: #64748b;
    font-weight: 600;
  }
}

.form-input-bold {
  font-weight: 700 !important;
}

.bullets-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.whatsapp-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 768px) {
  .bullets-row,
  .whatsapp-row {
    grid-template-columns: 1fr;
  }
}

/* Mobil Canlı Önizleme */
.mobile-preview-shell {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
}

.preview-caption {
  font-size: 10.5px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.4px;
  margin-bottom: 10px;
}

.hero-preview-card {
  background: linear-gradient(135deg, #16263b 0%, #0f1b2a 100%);
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.16);
}

.hero-preview-tag {
  font-size: 9.5px;
  font-weight: 800;
  color: #f07419;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.hero-preview-title {
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 8px;
}

.hero-preview-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 10.5px;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-preview-visual {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.change-image-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 11.5px;
  font-weight: 700;
  color: #f07419;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

/* Bölüm 2: Kategori Tablosu */
.add-category-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 9px;
  background: #132030;
  color: #ffffff;
  border: none;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:hover {
    background: #1e293b;
  }
}

.categories-table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;

  thead tr {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    text-align: left;
    padding: 11px 16px;
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.4px;
  }

  td {
    padding: 13px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.cat-row {
  background: #ffffff;
  transition: background 0.15s;

  &:hover {
    background: #f8fafc;
  }

  &--dragging {
    opacity: 0.5;
    background: #fff7ed;
  }
}

.drag-handle-cell {
  cursor: grab;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.cat-name {
  font-weight: 700;
  color: #0f172a;
}

.cat-count {
  font-weight: 600;
  color: #334155;
}

.status-toggle-pill {
  border: none;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;

  &--active {
    background: #dcfce7;
    color: #15803d;
  }

  &--passive {
    background: #f1f5f9;
    color: #64748b;
  }
}

.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.icon-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    color: #0f172a;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }

  &--delete:hover {
    background: #fef2f2 !important;
    color: #dc2626 !important;
  }
}

/* Bölüm 3: Kredi & Vitrin Maliyetleri */
.instant-active-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #f07419;
  font-size: 12px;
  font-weight: 700;
}

.credits-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1100px) {
  .credits-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .credits-cards-grid {
    grid-template-columns: 1fr;
  }
}

.credit-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--highlighted {
    background: #fffaf5;
    border: 1.5px solid #f07419;
  }
}

.credit-box-label {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.3px;

  &--orange {
    color: #ea580c;
  }
}

.credit-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.credit-number-input {
  width: 74px;
  height: 38px;
  border-radius: 9px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  outline: none;

  &--orange {
    border-color: #f07419;
    color: #ea580c;
  }
}

.credit-unit-text {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;

  &--orange {
    color: #ea580c;
  }
}

.credit-box-note {
  margin: 0;
  font-size: 11px;
  color: #64748b;
  line-height: 1.45;
}
</style>
