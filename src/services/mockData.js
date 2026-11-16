// Endüstriyel tekstil makineleri için yüksek çözünürlüklü SVG görsel üreticileri
function createMachinePhotoSvg({ title, subtitle, accent = '#f07419', bg1 = '#e2e8f0', bg2 = '#cbd5e1', type = 'full' }) {
  let machineIllustration = ''

  if (type === 'full') {
    machineIllustration = `
      <!-- Masa / Tabla -->
      <rect x="110" y="250" width="420" height="22" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="3"/>
      <!-- Ayaklar -->
      <rect x="145" y="272" width="18" height="145" fill="#475569"/>
      <rect x="475" y="272" width="18" height="145" fill="#475569"/>
      <rect x="140" y="370" width="360" height="12" fill="#64748b"/>
      <rect x="270" y="382" width="110" height="18" rx="4" fill="#334155"/>
      <!-- Servo Motor Kutusu -->
      <rect x="375" y="272" width="75" height="52" rx="6" fill="#1e293b"/>
      <circle cx="400" cy="298" r="10" fill="${accent}"/>
      <!-- Dikiş Makinesi Gövdesi -->
      <path d="M210 250 L210 130 Q210 105 235 105 L395 105 Q420 105 420 130 L420 250 L365 250 L365 160 L265 160 L265 220 L210 250 Z" fill="#ffffff" stroke="#64748b" stroke-width="3"/>
      <!-- Dijital Panel -->
      <rect x="368" y="125" width="42" height="58" rx="5" fill="#0f172a"/>
      <rect x="373" y="132" width="32" height="22" rx="2" fill="#0284c7"/>
      <circle cx="381" cy="166" r="3" fill="#38bdf8"/>
      <circle cx="390" cy="166" r="3" fill="#f07419"/>
      <circle cx="399" cy="166" r="3" fill="#22c55e"/>
      <!-- Marka Logosu -->
      <rect x="285" y="122" width="58" height="18" rx="3" fill="#0284c7"/>
      <text x="314" y="135" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-weight="800" font-size="11">JACK A4F</text>
      <!-- İğne Mili -->
      <rect x="225" y="215" width="8" height="32" fill="#334155"/>
      <!-- İplik Çardak -->
      <line x1="450" y1="250" x2="450" y2="55" stroke="#64748b" stroke-width="4"/>
      <line x1="415" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="3"/>
      <path d="M425 250 L432 205 L442 205 L448 250 Z" fill="#0284c7"/>
      <path d="M458 250 L465 205 L475 205 L481 250 Z" fill="#ea580c"/>
    `
  } else if (type === 'head') {
    machineIllustration = `
      <!-- Kafa ve İğne Yakın Çekim -->
      <rect x="80" y="60" width="480" height="320" rx="16" fill="#1e293b"/>
      <path d="M160 80 L340 80 L340 230 Q340 265 300 265 L200 265 Q160 265 160 230 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="4"/>
      <!-- Tansiyon Diskleri -->
      <circle cx="220" cy="165" r="26" fill="#334155" stroke="#cbd5e1" stroke-width="4"/>
      <circle cx="220" cy="165" r="12" fill="${accent}"/>
      <circle cx="285" cy="150" r="18" fill="#475569" stroke="#cbd5e1" stroke-width="3"/>
      <!-- İğne ve Baskı Ayağı -->
      <rect x="242" y="265" width="16" height="65" fill="#94a3b8"/>
      <line x1="250" y1="330" x2="250" y2="368" stroke="#f8fafc" stroke-width="3"/>
      <path d="M215 368 L285 368 L295 355" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
      <!-- LED Aydınlatma -->
      <circle cx="280" cy="290" r="35" fill="rgba(56, 189, 248, 0.2)"/>
    `
  } else if (type === 'table') {
    machineIllustration = `
      <!-- Tabla & Direct Drive Servo Motor -->
      <rect x="70" y="130" width="500" height="32" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>
      <rect x="120" y="162" width="24" height="220" fill="#334155"/>
      <rect x="490" y="162" width="24" height="220" fill="#334155"/>
      <!-- Servo Kontrol Ünitesi -->
      <rect x="250" y="162" width="160" height="105" rx="10" fill="#0f172a" stroke="#475569" stroke-width="3"/>
      <rect x="272" y="182" width="75" height="34" rx="4" fill="#064e3b"/>
      <text x="309" y="205" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="18">4000 RPM</text>
      <circle cx="380" cy="199" r="14" fill="${accent}"/>
      <text x="330" y="248" text-anchor="middle" fill="#94a3b8" font-family="Inter, sans-serif" font-size="11" font-weight="600">DIRECT DRIVE SERVO MOTOR</text>
    `
  } else {
    machineIllustration = `
      <!-- Metal Seri No ve CE Etiketi -->
      <rect x="110" y="85" width="420" height="270" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="4"/>
      <rect x="126" y="101" width="388" height="44" rx="6" fill="#0f172a"/>
      <text x="320" y="129" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-weight="800" font-size="18">JACK SEWING MACHINE CO., LTD.</text>
      <text x="150" y="180" fill="#334155" font-family="monospace" font-weight="700" font-size="15">MODEL   : JK-A4F-D-7</text>
      <text x="150" y="210" fill="#334155" font-family="monospace" font-weight="700" font-size="15">SERİ NO : SN-2026-88492014</text>
      <text x="150" y="240" fill="#334155" font-family="monospace" font-weight="700" font-size="15">VOLTAJ  : 220V ~ 50/60Hz 550W</text>
      <text x="150" y="270" fill="#16a34a" font-family="monospace" font-weight="700" font-size="15">DURUM   : ORİJİNAL FABRİKA ÇIKIŞLI</text>
      <rect x="420" y="285" width="70" height="44" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
      <text x="455" y="315" text-anchor="middle" fill="#0f172a" font-family="Inter, sans-serif" font-weight="900" font-size="22">CE</text>
    `
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" width="640" height="440">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="640" height="440" fill="url(#bg)"/>
    ${machineIllustration}
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const INITIAL_PENDING_LISTINGS = [
  {
    id: 'MJ-90412',
    code: '#MJ-90412',
    title: 'Jack A4F Otomatik Düz Dikiş',
    fullTitle: 'Jack A4F Otomatik Düz Dikiş Makinesi',
    sellerName: 'Şahin Tekstil Makina',
    sellerFullTitle: 'Şahin Tekstil Makina Sanayi',
    sellerTaxNo: '8320491823',
    sellerPhone: '0532 894 12 30',
    sellerVerified: true,
    sellerApprovedCount: 14,
    sellerComplaintCount: 0,
    price: 62500,
    formattedPrice: '₺62.500',
    condition: 'Sıfır',
    conditionDetail: 'Sıfır Fabrika Çıkışlı',
    category: 'Dikiş Makineleri',
    brand: 'Jack',
    model: 'A4F Otomatik',
    location: 'İstanbul / Merter',
    relativeTime: '14 dk önce',
    createdAtFormatted: '16 Kasım 2026, 15:42',
    status: 'Pending',
    isFeatured: false,
    description:
      'Sıfır kutusunda Jack A4F yeni nesil akıllı düz dikiş makinesi. Otomatik ayak kaldırma, hassas dijital dikiş adımı ayarı ve sesli Türkçe rehber desteği mevcuttur. Orijinal Jack tablası ve servo motoru ile eksiksiz teslim edilir. 2 yıl distribütör garantilidir.',
    thumbnail: createMachinePhotoSvg({
      title: 'Jack A4F',
      subtitle: 'Kapak Fotoğrafı',
      type: 'full'
    }),
    photos: [
      {
        id: 'p1',
        label: '1920x1080 • Net',
        topBadge: 'Kapak Fotoğrafı',
        resolution: '1920x1080 • Net',
        title: 'Kapak Fotoğrafı — Jack A4F Genel Görünüm',
        url: createMachinePhotoSvg({ type: 'full', bg1: '#f1f5f9', bg2: '#cbd5e1' })
      },
      {
        id: 'p2',
        label: 'Kafa Detayı',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Kafa & İğne Mili Yakın Çekim Detayı',
        url: createMachinePhotoSvg({ type: 'head', bg1: '#334155', bg2: '#1e293b' })
      },
      {
        id: 'p3',
        label: 'Tabla & Motor',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Orijinal Jack Tabla & Direct Drive Servo Motor',
        url: createMachinePhotoSvg({ type: 'table', bg1: '#e2e8f0', bg2: '#94a3b8' })
      },
      {
        id: 'p4',
        label: 'Etiket Bilgisi',
        topBadge: null,
        resolution: '1600x1200 • Okunaklı',
        title: 'Fabrika Seri Numarası ve CE Etiketi',
        url: createMachinePhotoSvg({ type: 'label', bg1: '#f8fafc', bg2: '#e2e8f0' })
      }
    ]
  },
  {
    id: 'MJ-90410',
    code: '#MJ-90410',
    title: 'Siruba 747K 4 İplik Overlok',
    fullTitle: 'Siruba 747K-514M2-24 4 İplik Sanayi Overlok Makinesi',
    sellerName: 'Merter Konfeksiyon',
    sellerFullTitle: 'Merter Konfeksiyon Makina Ticaret',
    sellerTaxNo: '6140293841',
    sellerPhone: '0533 412 88 90',
    sellerVerified: true,
    sellerApprovedCount: 9,
    sellerComplaintCount: 0,
    price: 38000,
    formattedPrice: '₺38.000',
    condition: 'İkinci El',
    conditionDetail: 'İkinci El (Bakımlı)',
    category: 'Overlok Makineleri',
    brand: 'Siruba',
    model: '747K 4 İplik',
    location: 'İstanbul / Zeytinburnu',
    relativeTime: '32 dk önce',
    createdAtFormatted: '16 Kasım 2026, 15:24',
    status: 'Pending',
    isFeatured: false,
    description:
      'Atölye değişikliği nedeniyle satılık Siruba 747K 4 iplik overlok makinesi. Tüm ağır bakımları yetkili serviste yeni yapıldı, bıçak ve lüper takımı yenilendi. Sessiz servo motorlu, çalışmaya hazır.',
    thumbnail: createMachinePhotoSvg({ type: 'head', accent: '#ea580c', bg1: '#f1f5f9', bg2: '#e2e8f0' }),
    photos: [
      {
        id: 's1',
        label: '1920x1080 • Net',
        topBadge: 'Kapak Fotoğrafı',
        resolution: '1920x1080 • Net',
        title: 'Siruba 747K Genel Görünüm',
        url: createMachinePhotoSvg({ type: 'full', accent: '#ea580c', bg1: '#f1f5f9', bg2: '#cbd5e1' })
      },
      {
        id: 's2',
        label: 'Lüper & Bıçak',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Overlok Lüper ve Bıçak Tertibatı',
        url: createMachinePhotoSvg({ type: 'head', accent: '#ea580c', bg1: '#1e293b', bg2: '#0f172a' })
      },
      {
        id: 's3',
        label: 'Tabla & Motor',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Gömme Tabla ve Sessiz Servo Motor',
        url: createMachinePhotoSvg({ type: 'table', accent: '#ea580c', bg1: '#e2e8f0', bg2: '#94a3b8' })
      },
      {
        id: 's4',
        label: 'Etiket Bilgisi',
        topBadge: null,
        resolution: '1280x960 • Net',
        title: 'Siruba Orijinal Seri Etiketi',
        url: createMachinePhotoSvg({ type: 'label', accent: '#ea580c', bg1: '#f8fafc', bg2: '#e2e8f0' })
      }
    ]
  },
  {
    id: 'MJ-90408',
    code: '#MJ-90408',
    title: 'Brother HE-800B Elektronik İlik',
    fullTitle: 'Brother HE-800B Elektronik Düz İlik Açma Makinesi',
    sellerName: 'Güngören Dikiş Ltd.',
    sellerFullTitle: 'Güngören Endüstriyel Dikiş Sistemleri Ltd. Şti.',
    sellerTaxNo: '4190882310',
    sellerPhone: '0542 710 45 12',
    sellerVerified: true,
    sellerApprovedCount: 27,
    sellerComplaintCount: 0,
    price: 115000,
    formattedPrice: '₺115.000',
    condition: 'Sıfır',
    conditionDetail: 'Sıfır Fabrika Çıkışlı',
    category: 'İlik-Düğme Makineleri',
    brand: 'Brother',
    model: 'HE-800B Elektronik',
    location: 'İstanbul / Güngören',
    relativeTime: '1 saat önce',
    createdAtFormatted: '16 Kasım 2026, 14:50',
    status: 'Pending',
    isFeatured: false,
    description:
      'Brother HE-800B dokunmatik panelli elektronik düz ilik makinesi. 90 farklı ilik deseni hafızası, elektronik iplik tansiyonu ve otomatik ayak kaldırma sistemiyle yüksek verimlilik sağlar.',
    thumbnail: createMachinePhotoSvg({ type: 'table', accent: '#0284c7', bg1: '#f1f5f9', bg2: '#e2e8f0' }),
    photos: [
      {
        id: 'b1',
        label: '1920x1080 • Net',
        topBadge: 'Kapak Fotoğrafı',
        resolution: '1920x1080 • Net',
        title: 'Brother HE-800B Elektronik İlik',
        url: createMachinePhotoSvg({ type: 'full', accent: '#0284c7', bg1: '#f1f5f9', bg2: '#cbd5e1' })
      },
      {
        id: 'b2',
        label: 'Kafa Detayı',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Dokunmatik Panel & İlik Bıçağı Detayı',
        url: createMachinePhotoSvg({ type: 'head', accent: '#0284c7', bg1: '#1e293b', bg2: '#0f172a' })
      },
      {
        id: 'b3',
        label: 'Tabla & Motor',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Orijinal Brother Stand & Pedal',
        url: createMachinePhotoSvg({ type: 'table', accent: '#0284c7', bg1: '#e2e8f0', bg2: '#94a3b8' })
      },
      {
        id: 'b4',
        label: 'Etiket Bilgisi',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Brother Barkod & Model Etiketi',
        url: createMachinePhotoSvg({ type: 'label', accent: '#0284c7', bg1: '#f8fafc', bg2: '#e2e8f0' })
      }
    ]
  },
  {
    id: 'MJ-90405',
    code: '#MJ-90405',
    title: 'Pegasus M900 Ağır Sanayi Overlok',
    fullTitle: 'Pegasus M900 Serisi 5 İplik Ağır Kumaş Overlok Makinesi',
    sellerName: 'Bursa Tekstil Servisi',
    sellerFullTitle: 'Bursa Tekstil Makina & Teknik Servis A.Ş.',
    sellerTaxNo: '1900458219',
    sellerPhone: '0532 601 22 16',
    sellerVerified: true,
    sellerApprovedCount: 19,
    sellerComplaintCount: 1,
    price: 54000,
    formattedPrice: '₺54.000',
    condition: 'İkinci El',
    conditionDetail: 'İkinci El (Revizyonlu)',
    category: 'Overlok Makineleri',
    brand: 'Pegasus',
    model: 'M900 5 İplik',
    location: 'Bursa / Yıldırım',
    relativeTime: '2 saat önce',
    createdAtFormatted: '16 Kasım 2026, 13:55',
    status: 'Pending',
    isFeatured: false,
    description:
      'Denim ve ağır dokuma kumaşlar için ideal Pegasus M900 5 iplik emniyet dikişli overlok makinesi. Yağ soğutma sistemi aktif, sıfır tabla ve Ho Hsing servo motor ile teslim edilecektir.',
    thumbnail: createMachinePhotoSvg({ type: 'full', accent: '#16a34a', bg1: '#e2e8f0', bg2: '#cbd5e1' }),
    photos: [
      {
        id: 'pg1',
        label: '1920x1080 • Net',
        topBadge: 'Kapak Fotoğrafı',
        resolution: '1920x1080 • Net',
        title: 'Pegasus M900 Genel Görünüm',
        url: createMachinePhotoSvg({ type: 'full', accent: '#16a34a', bg1: '#f1f5f9', bg2: '#cbd5e1' })
      },
      {
        id: 'pg2',
        label: 'Kafa Detayı',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Pegasus M900 Kafa Detayı',
        url: createMachinePhotoSvg({ type: 'head', accent: '#16a34a', bg1: '#1e293b', bg2: '#0f172a' })
      },
      {
        id: 'pg3',
        label: 'Tabla & Motor',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Tabla & Motor Görünümü',
        url: createMachinePhotoSvg({ type: 'table', accent: '#16a34a', bg1: '#e2e8f0', bg2: '#94a3b8' })
      },
      {
        id: 'pg4',
        label: 'Etiket Bilgisi',
        topBadge: null,
        resolution: '1920x1080 • Net',
        title: 'Pegasus Japonya Üretim Etiketi',
        url: createMachinePhotoSvg({ type: 'label', accent: '#16a34a', bg1: '#f8fafc', bg2: '#e2e8f0' })
      }
    ]
  }
]

export const INITIAL_SYSTEM_SETTINGS = {
  banner: {
    isActive: true,
    badgeText: 'PAZARYERİ PANOSU',
    title: 'Tekstil Makinelerinizi Hızlıca Alın, Satın!',
    bullet1: 'Sıfır ve İkinci El Makineler',
    bullet2: 'Güvenli İlan Sistemi',
    bullet3: 'Türkiye Genelinde Alım Satım',
    whatsappNumber: '+90 532 000 00 00',
    whatsappTemplate: 'Merhaba MakinaJet, sanayi dikiş makinesi ilanı hakkında destek almak istiyorum.',
    bannerImageUrl: ''
  },
  categories: [
    {
      id: 'cat-1',
      order: 1,
      name: 'Dikiş Makineleri',
      iconType: 'sewing',
      iconColor: '#ea580c',
      listingCount: 184,
      isActive: true
    },
    {
      id: 'cat-2',
      order: 2,
      name: 'Overlok Makineleri',
      iconType: 'overlock',
      iconColor: '#0284c7',
      listingCount: 96,
      isActive: true
    },
    {
      id: 'cat-3',
      order: 3,
      name: 'Reçme Makineleri',
      iconType: 'coverstitch',
      iconColor: '#0f172a',
      listingCount: 42,
      isActive: true
    },
    {
      id: 'cat-4',
      order: 4,
      name: 'İlik-Düğme Makineleri',
      iconType: 'buttonhole',
      iconColor: '#f07419',
      listingCount: 28,
      isActive: true
    },
    {
      id: 'cat-5',
      order: 5,
      name: 'Kesim Sistemleri',
      iconType: 'cutting',
      iconColor: '#0284c7',
      listingCount: 35,
      isActive: true
    },
    {
      id: 'cat-6',
      order: 6,
      name: 'Yedek Parçalar',
      iconType: 'spareparts',
      iconColor: '#16a34a',
      listingCount: 312,
      isActive: true
    }
  ],
  credits: {
    standardListingCredits: 1,
    showcase7DaysCredits: 5,
    urgentBadgeCredits: 2,
    creditUnitPriceTl: 50
  }
}

export const REJECTION_REASONS = [
  'Fotoğraflar kalitesiz / bulanık',
  'Eksik veya hatalı fiyat bilgisi',
  'Kategori / marka-model uyumsuzluğu',
  'Makine etiketi veya seri numarası okunmuyor',
  'Açıklamada yasaklı iletişim / reklam bilgisi',
  'Mükerrer veya sahte ilan şüphesi'
]
