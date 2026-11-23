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
                ref="whatsappInputRef"
                :value="settingsStore.banner.whatsappNumber"
                type="tel"
                inputmode="numeric"
                maxlength="17"
                class="mj-input form-input-bold"
                :class="{ 'mj-input--error': !settingsStore.whatsappValidation.valid }"
                placeholder="+90 532 000 00 00"
                @input="onWhatsappInput"
                @blur="settingsStore.formatWhatsappNumber()"
              />
              <span
                v-if="!settingsStore.whatsappValidation.valid"
                class="form-error-text"
              >
                {{ settingsStore.whatsappValidation.message }}
              </span>
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
                <li v-if="settingsStore.banner.bullet3">
                  ✓ {{ settingsStore.banner.bullet3 }}
                </li>
              </ul>
            </div>

            <div class="hero-preview-visual">
              <img
                v-if="settingsStore.banner.bannerImageUrl && !bannerImageError"
                :src="settingsStore.banner.bannerImageUrl"
                alt="Banner Görseli"
                @error="bannerImageError = true"
              />
              <CategoryIcon v-else type="sewing" color="#94a3b8" />
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
              İlk olarak üst (ana) kategorileri görüntüleyin; bir üst kategori seçerek alt kategorilerini filtreleyin ve yönetin
            </p>
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <button
            v-if="selectedParentFilterId !== null"
            type="button"
            class="add-subcat-top-btn"
            @click="openCategoryModal(null, selectedParentFilterId)"
          >
            <q-icon name="account_tree" size="16px" />
            <span>"{{ selectedParentCategoryObj?.name }}" Altına Ekle</span>
          </button>

          <button
            type="button"
            class="add-category-btn"
            @click="openCategoryModal(null, null)"
          >
            <q-icon name="add" size="17px" />
            <span>Yeni Ana Kategori Ekle</span>
          </button>
        </div>
      </div>

      <!-- Sadece Bir Ana Kategoriye Tıklandığında Açılan Üst Bilgi / Geri Dönüş Çubuğu -->
      <div v-if="selectedParentCategoryObj" class="selected-parent-banner q-mb-md">
        <div class="row items-center q-gutter-x-xs">
          <button type="button" class="breadcrumb-back-btn" @click="goUpOneCategoryLevel">
            <q-icon name="arrow_back" size="15px" />
            <span>Ana Kategorilere Dön</span>
          </button>
          <span class="text-grey-5">|</span>
          <span class="text-caption text-grey-7">Seçili Kategori:</span>
          <strong class="text-dark">{{ selectedParentCategoryObj.pathLabel || selectedParentCategoryObj.name }}</strong>
          <span class="cat-subcount-pill">{{ filteredCategoriesForTable.length }} Alt Kategori</span>
        </div>

        <button
          type="button"
          class="inline-add-sub-btn"
          @click="openCategoryModal(null, selectedParentCategoryObj.id)"
        >
          <q-icon name="add" size="15px" />
          <span>Bu Kategoriye Alt Kategori Ekle</span>
        </button>
      </div>

      <div class="categories-table-wrap">
        <table class="categories-table">
          <thead>
            <tr>
              <th style="width: 64px">SIRA</th>
              <th style="width: 74px">İKON</th>
              <th>{{ selectedParentFilterId === null ? 'ANA KATEGORİ ADI (ALT KATEGORİLER İÇİN TIKLAYIN)' : 'ALT KATEGORİ ADI' }}</th>
              <th style="width: 310px">İLAN SAYILARI</th>
              <th style="width: 120px">DURUM</th>
              <th style="width: 190px; text-align: right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredCategoriesForTable.length === 0">
              <td colspan="6" style="text-align: center; padding: 28px; color: #64748b">
                <template v-if="selectedParentFilterId === null">
                  Henüz kayıtlı ana kategori bulunmuyor. Sağ üstten yeni ana kategori ekleyebilirsiniz.
                </template>
                <template v-else>
                  <strong>"{{ selectedParentCategoryObj?.name }}"</strong> kategorisine ait alt kategori bulunmuyor.
                  Yukarıdaki <strong>"Bu Kategoriye Alt Kategori Ekle"</strong> butonundan hemen ekleyebilirsiniz.
                </template>
              </td>
            </tr>
            <tr
              v-for="(cat, idx) in filteredCategoriesForTable"
              :key="cat.id"
              draggable="true"
              class="cat-row cat-row--clickable"
              :class="{ 'cat-row--dragging': draggedIndex === idx }"
              title="Alt kategorilerini görüntülemek için satıra tıklayın"
              @click="selectedParentFilterId = Number(cat.id)"
              @dragstart="onDragStart(idx)"
              @dragover.prevent
              @drop="onDrop(idx)"
              @dragend="draggedIndex = null"
            >
              <td @click.stop>
                <div class="drag-handle-cell" title="Sıralamak için sürükleyin">
                  <q-icon name="drag_indicator" size="18px" class="drag-icon" />
                </div>
              </td>

              <td>
                <CategoryIcon :type="cat.iconType" :color="cat.iconColor" :svg="cat.iconSvg" />
              </td>

              <td>
                <div class="cat-name-cell">
                  <div class="cat-name-stack">
                    <div class="row items-center q-gutter-x-xs">
                      <span class="cat-name cat-name--clickable">
                        {{ cat.name }}
                      </span>
                      <span class="cat-subcount-pill">
                        {{ getDirectChildrenCount(cat.id) }} Alt Kategori
                      </span>
                      <q-icon name="chevron_right" size="18px" color="grey-6" />
                    </div>
                    <div v-if="cat.parentId && cat.pathLabel" class="cat-path-breadcrumb">
                      {{ cat.pathLabel }}
                    </div>
                  </div>
                </div>
              </td>

              <td>
                <div class="cat-counts-group">
                  <span class="cat-count-badge cat-count-badge--total" title="Toplam İlan">
                    Toplam: <strong>{{ cat.totalListingCount ?? cat.listingCount ?? 0 }}</strong>
                  </span>
                  <span class="cat-count-badge cat-count-badge--approved" title="Yayındaki İlanlar">
                    Yayında: <strong>{{ cat.approvedListingCount ?? 0 }}</strong>
                  </span>
                  <span class="cat-count-badge cat-count-badge--pending" title="Onay Bekleyen İlanlar">
                    Bekleyen: <strong>{{ cat.pendingListingCount ?? 0 }}</strong>
                  </span>
                  <span class="cat-count-badge cat-count-badge--rejected" title="Reddedilen İlanlar">
                    Ret: <strong>{{ cat.rejectedListingCount ?? 0 }}</strong>
                  </span>
                </div>
              </td>

              <td @click.stop>
                <button
                  type="button"
                  class="status-toggle-pill"
                  :class="cat.isActive ? 'status-toggle-pill--active' : 'status-toggle-pill--passive'"
                  @click="toggleCategoryStatus(cat)"
                >
                  {{ cat.isActive ? 'Aktif' : 'Pasif' }}
                </button>
              </td>

              <td style="text-align: right" @click.stop>
                <div class="row-actions">
                  <button
                    type="button"
                    class="icon-action-btn icon-action-btn--add-sub"
                    title="Bu Kategorinin Altına Alt Kategori Ekle"
                    @click="openCategoryModal(null, cat.id)"
                  >
                    <q-icon name="account_tree" size="15px" />
                  </button>
                  <button
                    type="button"
                    class="icon-action-btn"
                    title="Yukarı Taşı"
                    :disabled="idx === 0"
                    @click="moveFilteredCategory(idx, idx - 1)"
                  >
                    <q-icon name="keyboard_arrow_up" size="17px" />
                  </button>
                  <button
                    type="button"
                    class="icon-action-btn"
                    title="Aşağı Taşı"
                    :disabled="idx === filteredCategoriesForTable.length - 1"
                    @click="moveFilteredCategory(idx, idx + 1)"
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

    <!-- BÖLÜM 3: TL Cinsinden İlan, Promosyon ve Mağaza Fiyatlandırması -->
    <section ref="creditsSectionRef" class="settings-card mj-card">
      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon-box">
            <q-icon name="payments" size="20px" />
          </div>
          <div>
            <h2 class="section-title">İlan, Kalın Yazı, Öne Çıkar ve Mağaza Fiyatlandırması (TL / TRY)</h2>
            <p class="section-desc">
              Standart ilan paylaşımı ücretsizdir (0 TL). Kalın Yazı, 7 Günlük Öne Çıkar ve Mağaza Aylık Abonelik ücretlerini TL cinsinden belirleyin
            </p>
          </div>
        </div>

        <div class="instant-active-tag">
          <q-icon name="bolt" size="16px" />
          <span>TL (TRY) Cinsinden Anında Geçerli</span>
        </div>
      </div>

      <div class="credits-cards-grid">
        <!-- Kart 1: Standart İlan Yayınlama (listingPublishPriceTl) -->
        <div class="credit-box">
          <div class="credit-box-label">STANDART İLAN PAYLAŞIMI</div>
          <div class="credit-input-row">
            <span class="credit-unit-text">₺</span>
            <input
              v-model.number="settingsStore.pricing.listingPublishPriceTl"
              type="number"
              step="0.01"
              min="0"
              class="credit-number-input"
              style="width: 96px"
            />
            <span class="credit-unit-text">TL</span>
          </div>
          <p class="credit-box-note">
            Standart ilan oluşturma ücretsizdir (`0.00 TL`).
          </p>
        </div>

        <!-- Kart 2: Kalın Yazı Ücreti (boldTitlePriceTl) -->
        <div class="credit-box">
          <div class="credit-box-label">İLAN BAŞLIĞINDA KALIN YAZI</div>
          <div class="credit-input-row">
            <span class="credit-unit-text">₺</span>
            <input
              v-model.number="settingsStore.pricing.boldTitlePriceTl"
              type="number"
              step="0.01"
              min="0"
              class="credit-number-input"
              style="width: 96px"
            />
            <span class="credit-unit-text">TL</span>
          </div>
          <p class="credit-box-note">
            İlan başlığını kalın ve dikkat çekici gösterir (`boldTitlePriceTl`).
          </p>
        </div>

        <!-- Kart 3: 7 Günlük Öne Çıkar / Vitrin (featuredBoost7DaysPriceTl) -->
        <div class="credit-box credit-box--highlighted">
          <div class="credit-box-label credit-box-label--orange">
            7 GÜNLÜK ÖNE ÇIKAR (VİTRİN)
          </div>
          <div class="credit-input-row">
            <span class="credit-unit-text credit-unit-text--orange">₺</span>
            <input
              v-model.number="settingsStore.pricing.featuredBoost7DaysPriceTl"
              type="number"
              step="0.01"
              min="0"
              class="credit-number-input credit-number-input--orange"
              style="width: 100px"
            />
            <span class="credit-unit-text credit-unit-text--orange">TL / 7 Gün</span>
          </div>
          <p class="credit-box-note">
            Ana sayfa vitrininde ve üst sıralarda öne çıkarılır (`featuredBoost7DaysPriceTl`).
          </p>
        </div>

        <!-- Kart 4: Mağaza Aylık Abonelik Ücreti (Sınırsız İlan) -->
        <div class="credit-box credit-box--store">
          <div class="row items-center justify-between">
            <div class="credit-box-label credit-box-label--store">
              MAĞAZA AYLIK ABONELİK ÜCRETİ (SINIRSIZ İLAN)
            </div>
            <span class="mj-badge-green">Kurumsal Mağaza (`UserType = Store`)</span>
          </div>

          <div class="store-fee-row">
            <div class="credit-input-row">
              <span class="credit-unit-text credit-unit-text--store">₺</span>
              <input
                v-model.number="settingsStore.pricing.storeMonthlySubscriptionFee"
                type="number"
                step="0.01"
                min="0"
                class="credit-number-input credit-number-input--store"
              />
              <span class="credit-unit-text credit-unit-text--store">TL / Ay (Sınırsız İlan)</span>
            </div>

            <div class="row items-center q-gutter-x-sm">
              <button
                type="button"
                class="save-store-fee-btn"
                :disabled="savingStoreFee"
                @click="handleUpdateStoreFee"
              >
                <q-spinner-dots v-if="savingStoreFee" color="white" size="15px" />
                <template v-else>
                  <q-icon name="published_with_changes" size="16px" />
                  <span>Aylık Ücreti Güncelle</span>
                </template>
              </button>

              <router-link to="/stores" class="manage-stores-link">
                <q-icon name="storefront" size="16px" />
                <span>Mağaza Başvurularını Yönet</span>
              </router-link>
            </div>
          </div>

          <p class="credit-box-note">
            Vergi numarası veya doğrulama bilgisiyle admin onayı (`Approved`) alan mağaza kullanıcıları, bu aylık abonelik ücretini ödeyerek 30 gün boyunca sınırsız ilan paylaşabilir.
          </p>
        </div>
      </div>
    </section>

    <!-- Kategori Ekle / Düzenle Modalı -->
    <q-dialog v-model="categoryModalOpen">
      <q-card style="width: 540px; max-width: 95vw; border-radius: 16px">
        <q-card-section class="row items-center justify-between border-bottom">
          <div class="text-subtitle1 text-weight-bold">
            {{ editingCategoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <!-- Üst Kategori Seçimi (Ana Kategori veya Alt Kategori) -->
          <div>
            <label class="form-label">Üst Kategori (`parentId`)</label>
            <select v-model="categoryForm.parentId" class="mj-input">
              <option :value="null">— Ana Kategori (Üst Kategorisi Yok) —</option>
              <option
                v-for="parentOpt in availableParentCategories"
                :key="parentOpt.id"
                :value="parentOpt.id"
              >
                {{ '—'.repeat(parentOpt.depth || 0) }} {{ parentOpt.pathLabel || parentOpt.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="form-label">Kategori Adı</label>
            <input
              v-model="categoryForm.name"
              type="text"
              class="mj-input"
              placeholder="Örn: Ütü & Buhar Kazanları"
            />
          </div>

          <!-- Görsel İkon Seçici Grid -->
          <div>
            <div class="row items-center justify-between q-mb-xs">
              <label class="form-label q-mb-none">
                Kategori İkonu Seçin ({{ CATEGORY_ICON_OPTIONS.length }} Hazır İkon veya Özel SVG)
              </label>
              <label class="upload-svg-btn">
                <q-icon name="upload_file" size="15px" />
                <span>.SVG Dosyası Yükle</span>
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  style="display: none"
                  @change="handleSvgFileUpload"
                />
              </label>
            </div>
            <div class="icon-picker-grid">
              <button
                v-for="item in CATEGORY_ICON_OPTIONS"
                :key="item.value"
                type="button"
                class="icon-picker-card"
                :class="{ 'icon-picker-card--active': !categoryForm.iconSvg && categoryForm.iconType === item.value }"
                @click="selectPresetIcon(item.value)"
              >
                <div
                  class="icon-picker-preview"
                  :style="{
                    backgroundColor:
                      !categoryForm.iconSvg && categoryForm.iconType === item.value
                        ? categoryForm.iconColor + '15'
                        : '#f8fafc'
                  }"
                >
                  <CategoryIcon
                    :type="item.value"
                    :color="
                      !categoryForm.iconSvg && categoryForm.iconType === item.value
                        ? categoryForm.iconColor
                        : '#475569'
                    "
                  />
                </div>
                <span class="icon-picker-label">{{ item.label }}</span>
              </button>
            </div>
          </div>

          <!-- Özel SVG Kodu Yapıştırma / Düzenleme Alanı -->
          <div>
            <div class="row items-center justify-between q-mb-xs">
              <label class="form-label q-mb-none">
                Özel SVG Kodu (`iconSvg` - Doluysa Hazır İkon Yerine Bu Kullanılır)
              </label>
              <button
                v-if="categoryForm.iconSvg"
                type="button"
                class="clear-svg-link"
                @click="categoryForm.iconSvg = ''"
              >
                Özel SVG'yi Temizle
              </button>
            </div>
            <textarea
              v-model="categoryForm.iconSvg"
              rows="3"
              class="mj-input"
              style="font-family: monospace; font-size: 11px"
              placeholder="<svg viewBox=&quot;0 0 24 24&quot; ...>...</svg> kodunu yapıştırın veya yukarıdan .svg dosyası seçin"
            ></textarea>
          </div>

          <!-- Görsel Renk Seçici -->
          <div>
            <label class="form-label">İkon Rengi</label>
            <div class="color-picker-row">
              <button
                v-for="clr in CATEGORY_COLOR_OPTIONS"
                :key="clr.value"
                type="button"
                class="color-swatch-btn"
                :class="{ 'color-swatch-btn--active': categoryForm.iconColor === clr.value }"
                @click="categoryForm.iconColor = clr.value"
              >
                <span class="color-swatch-dot" :style="{ backgroundColor: clr.value }"></span>
                <span>{{ clr.label }}</span>
              </button>
            </div>
          </div>

          <!-- Seçilen İkon & Kategori Canlı Önizleme -->
          <div class="selected-cat-preview">
            <div
              class="selected-cat-preview-icon"
              :style="{ backgroundColor: categoryForm.iconColor + '16' }"
            >
              <CategoryIcon
                :type="categoryForm.iconType"
                :color="categoryForm.iconColor"
                :svg="categoryForm.iconSvg"
              />
            </div>
            <div>
              <div class="selected-cat-preview-title">
                {{ categoryForm.name.trim() || 'Örnek Kategori Adı' }}
              </div>
              <div class="selected-cat-preview-sub">
                Mobil uygulamada görünecek kategori kartı önizlemesi
              </div>
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
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { useSettingsStore } from '@/stores/settingsStore'

const route = useRoute()
const $q = useQuasar()
const settingsStore = useSettingsStore()

const creditsSectionRef = ref(null)
const whatsappInputRef = ref(null)
const draggedIndex = ref(null)
const selectedParentFilterId = ref(null) // null -> İlk olarak sadece Üst (Ana) Kategoriler listelenir

const rootCategories = computed(() => {
  return settingsStore.categories.filter((c) => !c.parentId)
})

const selectedParentCategoryObj = computed(() => {
  if (selectedParentFilterId.value === null) return null
  return (
    settingsStore.categories.find(
      (c) => Number(c.id) === Number(selectedParentFilterId.value)
    ) || null
  )
})

const filteredCategoriesForTable = computed(() => {
  if (selectedParentFilterId.value === null) {
    // İlk başta yalnızca üst (ana) kategorileri listele
    return settingsStore.categories.filter((c) => !c.parentId)
  }
  // Bir üst kategori seçildiğinde onun alt kategorilerini filtrele
  return settingsStore.categories.filter(
    (c) => Number(c.parentId) === Number(selectedParentFilterId.value)
  )
})

function getDirectChildrenCount(parentId) {
  return settingsStore.categories.filter(
    (c) => Number(c.parentId) === Number(parentId)
  ).length
}

function goUpOneCategoryLevel() {
  if (!selectedParentCategoryObj.value) {
    selectedParentFilterId.value = null
    return
  }
  const upperParentId = selectedParentCategoryObj.value.parentId
  selectedParentFilterId.value = upperParentId ? Number(upperParentId) : null
}

function moveFilteredCategory(fromFilteredIdx, toFilteredIdx) {
  const list = filteredCategoriesForTable.value
  const fromItem = list[fromFilteredIdx]
  const toItem = list[toFilteredIdx]
  if (!fromItem || !toItem) return
  const realFrom = settingsStore.categories.findIndex((c) => c.id === fromItem.id)
  const realTo = settingsStore.categories.findIndex((c) => c.id === toItem.id)
  if (realFrom !== -1 && realTo !== -1) {
    settingsStore.moveCategory(realFrom, realTo)
  }
}

// Kategori İkon ve Renk Seçenekleri
const CATEGORY_ICON_OPTIONS = [
  { value: 'sewing', label: 'Dikiş Makinesi' },
  { value: 'overlock', label: 'Overlok' },
  { value: 'coverstitch', label: 'Reçme' },
  { value: 'buttonhole', label: 'İlik-Düğme' },
  { value: 'cutting', label: 'Kesim Sistemi' },
  { value: 'ironing', label: 'Ütü & Buhar' },
  { value: 'embroidery', label: 'Nakış & İşleme' },
  { value: 'knitting', label: 'Örme & Triko' },
  { value: 'pressing', label: 'Pres & Yapıştırma' },
  { value: 'thread', label: 'İplik & Sarım' },
  { value: 'fabric', label: 'Kumaş & Serim' },
  { value: 'automation', label: 'Otomasyon / Motor' },
  { value: 'spareparts', label: 'Yedek Parça' }
]

const CATEGORY_COLOR_OPTIONS = [
  { value: '#ea580c', label: 'Turuncu' },
  { value: '#0284c7', label: 'Mavi' },
  { value: '#16a34a', label: 'Yeşil' },
  { value: '#7c3aed', label: 'Mor' },
  { value: '#db2777', label: 'Fuşya' },
  { value: '#0d9488', label: 'Turkuaz' },
  { value: '#0f172a', label: 'Lacivert' }
]

// Kategori Ekle/Düzenle Modal state
const categoryModalOpen = ref(false)
const editingCategoryId = ref(null)
const categoryForm = reactive({
  name: '',
  parentId: null,
  iconType: 'sewing',
  iconSvg: '',
  iconColor: '#ea580c',
  listingCount: 0,
  isActive: true
})

// Döngüsel üst kategori seçilmesini önlemek için düzenlenen kategoriyi ve onun alt ağacını filtrele
const availableParentCategories = computed(() => {
  if (!editingCategoryId.value) {
    return settingsStore.categories
  }
  const excludedIds = new Set([Number(editingCategoryId.value)])
  let added = true
  while (added) {
    added = false
    for (const cat of settingsStore.categories) {
      if (cat.parentId && excludedIds.has(Number(cat.parentId)) && !excludedIds.has(Number(cat.id))) {
        excludedIds.add(Number(cat.id))
        added = true
      }
    }
  }
  return settingsStore.categories.filter((c) => !excludedIds.has(Number(c.id)))
})

function selectPresetIcon(iconVal) {
  categoryForm.iconType = iconVal
  categoryForm.iconSvg = ''
}

function handleSvgFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const content = String(reader.result || '').trim()
    if (content.includes('<svg')) {
      categoryForm.iconSvg = content
      categoryForm.iconType = 'custom'
      $q.notify({
        type: 'positive',
        message: 'Özel SVG dosyası yüklendi!'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Seçilen dosya geçerli bir <svg> etiketi içermiyor.'
      })
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const showBannerImageDialog = ref(false)
const bannerImageError = ref(false)
const savingStoreFee = ref(false)

async function handleUpdateStoreFee() {
  savingStoreFee.value = true
  try {
    const updatedFee = await settingsStore.updateStoreMonthlyFee(
      settingsStore.pricing.storeMonthlySubscriptionFee
    )
    $q.notify({
      type: 'positive',
      icon: 'storefront',
      message: `Mağaza aylık abonelik ücreti ₺${Number(updatedFee).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} olarak güncellendi!`,
      position: 'top-right',
      timeout: 2500
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      icon: 'error_outline',
      message:
        err.response?.data?.message ||
        err.message ||
        'Mağaza aylık ücreti güncellenirken bir hata oluştu.',
      position: 'top-right'
    })
  } finally {
    savingStoreFee.value = false
  }
}

watch(
  () => settingsStore.banner.bannerImageUrl,
  () => {
    bannerImageError.value = false
  }
)

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

function onWhatsappInput(e) {
  const masked = settingsStore.applyWhatsappMask(e.target.value)
  if (e.target.value !== masked) {
    e.target.value = masked
  }
}

async function handlePublishChanges() {
  if (!settingsStore.whatsappValidation.valid) {
    $q.notify({
      type: 'negative',
      icon: 'warning',
      message: settingsStore.whatsappValidation.message,
      position: 'top-right',
      timeout: 3000
    })
    whatsappInputRef.value?.focus()
    return
  }

  try {
    await settingsStore.publishAllSettings()
    $q.notify({
      type: 'positive',
      icon: 'cloud_done',
      message: 'Kategori, Hero Banner ve Kredi parametreleri canlıya yayınlandı!',
      position: 'top-right',
      timeout: 2500
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      icon: 'error_outline',
      message: err.message || 'Ayarlar yayınlanırken bir hata oluştu.',
      position: 'top-right',
      timeout: 3000
    })
  }
}

function onDragStart(idx) {
  draggedIndex.value = idx
}

function onDrop(targetIdx) {
  if (draggedIndex.value === null || draggedIndex.value === targetIdx) return
  moveFilteredCategory(draggedIndex.value, targetIdx)
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

function openCategoryModal(cat = null, presetParentId = null) {
  if (cat) {
    editingCategoryId.value = cat.id
    categoryForm.name = cat.name
    categoryForm.parentId = cat.parentId ?? null
    categoryForm.iconType = cat.iconType
    categoryForm.iconSvg = cat.iconSvg || ''
    categoryForm.iconColor = cat.iconColor
    categoryForm.listingCount = cat.listingCount
    categoryForm.isActive = cat.isActive
  } else {
    editingCategoryId.value = null
    categoryForm.name = ''
    categoryForm.parentId = presetParentId ?? null
    categoryForm.iconType = 'sewing'
    categoryForm.iconSvg = ''
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
      parentId: categoryForm.parentId || null,
      iconType: categoryForm.iconType,
      iconSvg: categoryForm.iconSvg.trim(),
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
      parentId: categoryForm.parentId || null,
      iconType: categoryForm.iconType,
      iconSvg: categoryForm.iconSvg.trim(),
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

.mj-input--error {
  border-color: #dc2626 !important;
  background-color: #fef2f2 !important;

  &:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15) !important;
  }
}

.form-error-text {
  font-size: 11.5px;
  font-weight: 600;
  color: #dc2626;
  line-height: 1.35;
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

/* Bölüm 2: Kategori Tablosu ve Üst/Alt Kategori Filtreleme */
.add-subcat-top-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:hover {
    background: #dbeafe;
  }
}

.category-hierarchy-filter-bar {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hierarchy-pills-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hierarchy-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  &--active {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;

    .hierarchy-pill-count {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }
  }
}

.hierarchy-pill-count {
  background: #e2e8f0;
  color: #475569;
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
}

.selected-parent-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.breadcrumb-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
}

.inline-add-sub-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f07419;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #e0650e;
  }
}

.cat-name--clickable {
  cursor: pointer;

  &:hover {
    color: #f07419;
    text-decoration: underline;
  }
}

.subcat-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid #fed7aa;
  background: #fff7ed;
  color: #ea580c;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f07419;
    color: #ffffff;
    border-color: #f07419;
  }
}

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

  &--clickable {
    cursor: pointer;
  }

  &:hover {
    background: #fff7ed;
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

.cat-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subcat-branch-indicator {
  color: #94a3b8;
  font-weight: 800;
  font-size: 14px;
  line-height: 1;
}

.cat-name-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-level-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;

  &--root {
    background: #f1f5f9;
    color: #475569;
  }

  &--sub {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }
}

.cat-subcount-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: #fff7ed;
  color: #ea580c;
  border: 1px solid #fed7aa;
}

.cat-path-breadcrumb {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 500;
}

.icon-action-btn--add-sub {
  color: #0284c7 !important;

  &:hover {
    background: #e0f2fe !important;
    color: #0369a1 !important;
  }
}

.cat-count {
  font-weight: 600;
  color: #334155;
}

.cat-counts-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.cat-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;

  strong {
    font-weight: 800;
  }

  &--total {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
  }

  &--approved {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  &--pending {
    background: #fff7ed;
    color: #c2410c;
    border: 1px solid #fed7aa;
  }

  &--rejected {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }
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

  &--store {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
    border: 1.5px solid #0284c7;
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

  &--store {
    color: #0369a1;
  }
}

.store-fee-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.save-store-fee-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  border: none;
  background: #0284c7;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #0369a1;
  }
}

.manage-stores-link {
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #f1f5f9;
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

  &--store {
    width: 135px;
    border-color: #0284c7;
    color: #0369a1;
  }
}

.credit-unit-text {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;

  &--orange {
    color: #ea580c;
  }

  &--store {
    color: #0369a1;
  }
}

.credit-box-note {
  margin: 0;
  font-size: 11px;
  color: #64748b;
  line-height: 1.45;
}

/* Kategori Modalı Görsel İkon & Renk Seçici */
.upload-svg-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 7px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #ea580c;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #ffedd5;
  }
}

.clear-svg-link {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 235px;
  overflow-y: auto;
  padding: 2px;
}

@media (max-width: 520px) {
  .icon-picker-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.icon-picker-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  &--active {
    border-color: #f07419;
    background: #fffaf5;
    box-shadow: 0 2px 8px rgba(240, 116, 25, 0.15);
  }
}

.icon-picker-preview {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.icon-picker-label {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  text-align: center;
  line-height: 1.2;
}

.color-picker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-swatch-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 999px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  &--active {
    border-color: #0f172a;
    background: #f8fafc;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.1);
  }
}

.color-swatch-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  flex-shrink: 0;
}

.selected-cat-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 11px;
}

.selected-cat-preview-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.selected-cat-preview-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.selected-cat-preview-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}
</style>
