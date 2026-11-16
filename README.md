# MakinaJet Web Yönetim (Admin) Paneli V2.4

Endüstriyel tekstil makineleri pazaryeri **MakinaJet** için geliştirilmiş **Vue 3 + Quasar UI + Pinia + Vue Router** tabanlı Web Yönetim ve Moderasyon Portalı.

## Özellikler (Adım 6 Kapsamı)

1. **Vue.js + Quasar Kurulumu & JWT Rol Kontrolü (`Role == Admin`)**
   - [src/pages/LoginPage.vue](src/pages/LoginPage.vue): Kurumsal yönetici giriş ekranı, 8 saat oturum koruma seçeneği ve sunucu durum göstergesi.
   - [src/utils/jwt.js](src/utils/jwt.js) & [src/stores/authStore.js](src/stores/authStore.js): JWT token payload çözümleme (`Role == "Admin"` ve Microsoft role claim kontrolü).
   - [src/router/index.js](src/router/index.js): `requiresAdmin` route guard ile yetkisiz erişimleri engelleme.

2. **İlan Moderasyon Merkezi**
   - [src/pages/ModerationPage.vue](src/pages/ModerationPage.vue): Onay bekleyen ilan kuyruğu (en eskiden en yeniye), arama ve sıfır/ikinci el filtreleme.
   - 4'lü makine fotoğraf galerisi ve tam ekran yakınlaştırmalı (zoom) kalite kontrol lightbox modalı.
   - Tek tıkla **Onayla**, **Öne Çıkar (Vitrin)** ve **Reddet** (hazır sebep seçimi + özel açıklama notu ile SMS/bildirim tetikleme).

3. **Kategori, Banner ve Kredi Ayarları Yönetimi**
   - [src/pages/SettingsPage.vue](src/pages/SettingsPage.vue):
     - **Ana Sayfa Hero Banner & WhatsApp Destek Hattı**: Başlık, 3 tik maddesi, WhatsApp numarası/şablonu ve eşzamanlı **Mobil Canlı Önizleme** kartı.
     - **Kategori Yönetimi ve Sıralama**: Sürükle-bırak (Drag & Drop) ve yukarı/aşağı oklarla sıralama, yeni kategori ekleme, düzenleme, aktif/pasif durum değiştirme ve silme.
     - **İlan ve Vitrin Kredi Maliyetleri (Monetizasyon)**: Standart ilan, 7 günlük Ana Sayfa Vitrin (otomatik TL karşılığı hesaplamalı), Acil Satılık rozeti ve 1 Kredi birim fiyatı yönetimi.

## API Bağlantısı

Varsayılan olarak `.env` dosyasında tanımlı `http://localhost:5083` adresindeki Backend API'ye bağlanır:

```env
VITE_API_BASE_URL=http://localhost:5083
```

## Çalıştırma

```bash
npm install
npm run dev
```
