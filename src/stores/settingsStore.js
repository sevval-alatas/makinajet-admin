import { defineStore } from 'pinia'
import { apiClient } from '@/services/api'

const ICON_COLOR_MAP = {
  sewing: '#ea580c',
  sewing_machine: '#ea580c',
  overlock: '#0284c7',
  coverstitch: '#0f172a',
  buttonhole: '#f07419',
  cutting: '#0284c7',
  ironing: '#7c3aed',
  embroidery: '#db2777',
  knitting: '#0d9488',
  pressing: '#d97706',
  thread: '#2563eb',
  fabric: '#4f46e5',
  automation: '#0f172a',
  spareparts: '#16a34a'
}

/**
 * Yazdıkça telefon numarasını "+90 5XX XXX XX XX" şeklinde maskeler.
 * Harfleri otomatik temizler ve 10 ulusal haneyle sınırlar.
 */
export function maskTurkishPhone(rawInput) {
  const digits = String(rawInput ?? '').replace(/\D/g, '')
  if (!digits) return ''

  let national = digits
  if (national.startsWith('0090')) {
    national = national.slice(4)
  } else if (national.startsWith('90')) {
    national = national.slice(2)
  } else if (national.startsWith('0')) {
    national = national.slice(1)
  }

  // En fazla 10 ulusal hane (örn: 532 000 00 00)
  national = national.slice(0, 10)

  if (national.length === 0) {
    return '+90 '
  }

  let masked = '+90 ' + national.slice(0, 3)
  if (national.length > 3) {
    masked += ' ' + national.slice(3, 6)
  }
  if (national.length > 6) {
    masked += ' ' + national.slice(6, 8)
  }
  if (national.length > 8) {
    masked += ' ' + national.slice(8, 10)
  }

  return masked
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    banner: {
      isActive: true,
      badgeText: 'PAZARYERİ PANOSU',
      title: '',
      bullet1: '',
      bullet2: '',
      bullet3: '',
      whatsappNumber: '',
      whatsappTemplate: '',
      bannerImageUrl: ''
    },
    categories: [],
    pricing: {
      listingPublishPriceTl: 0.00,
      boldTitlePriceTl: 99.90,
      featuredBoost7DaysPriceTl: 249.90,
      doping7DaysPriceTl: 349.90,
      storeMonthlySubscriptionFee: 1499.90
    },
    credits: {
      listingPublishPriceTl: 0.00,
      boldTitlePriceTl: 99.90,
      featuredBoost7DaysPriceTl: 249.90,
      doping7DaysPriceTl: 349.90,
      storeMonthlySubscriptionFee: 1499.90
    },
    transactions: [],
    saving: false,
    lastPublishedAt: null
  }),

  getters: {
    showcasePriceTl(state) {
      const credits = Number(state.credits.showcase7DaysCredits) || 0
      const unitPrice = Number(state.credits.creditUnitPriceTl) || 0
      return credits * unitPrice
    },

    whatsappValidation(state) {
      const raw = (state.banner?.whatsappNumber || '').trim()
      if (!raw) {
        return {
          valid: false,
          message: 'WhatsApp destek numarası boş bırakılamaz.',
          formatted: ''
        }
      }

      // Sadece rakam, +, boşluk, parantez ve tire karakterlerine izin ver
      if (!/^[+\d\s()-]+$/.test(raw)) {
        return {
          valid: false,
          message: 'Numarada harf veya geçersiz özel karakter bulunamaz.',
          formatted: raw
        }
      }

      // Tüm rakamları ayıkla
      let digits = raw.replace(/\D/g, '')

      // 0090... -> 90... veya 05xx... -> 905xx... veya 5xx... -> 905xx...
      if (digits.startsWith('0090')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0') && digits.length === 11) {
        digits = '90' + digits.slice(1)
      } else if (digits.startsWith('5') && digits.length === 10) {
        digits = '90' + digits
      }

      // Türkiye GSM operatör kontrolü (90 + 5XX XXX XX XX = 12 rakam)
      if (digits.startsWith('90')) {
        const national = digits.slice(2)
        if (national.length > 0 && !national.startsWith('5')) {
          return {
            valid: false,
            message: 'Türkiye cep telefonu numaraları 5 ile başlamalıdır (Örn: +90 532 000 00 00).',
            formatted: raw
          }
        }
        if (digits.length < 12) {
          return {
            valid: false,
            message: `Numara eksik (${12 - digits.length} rakam daha girilmeli). Örn: +90 532 000 00 00`,
            formatted: raw
          }
        }
        if (digits.length > 12) {
          return {
            valid: false,
            message: 'Numara çok uzun. Lütfen kontrol edin (Örn: +90 532 000 00 00).',
            formatted: raw
          }
        }
        const operatorCode = digits.slice(2, 5)
        if (!/^5(0[1567]|1[06]|24|3\d|4\d|5[1-59]|61)\d*$/.test(operatorCode)) {
          return {
            valid: false,
            message: `Geçersiz operatör kodu (${operatorCode}). Numara 53X, 54X, 55X veya 50X ile başlamalıdır.`,
            formatted: raw
          }
        }

        const formatted = `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
        return {
          valid: true,
          message: '',
          formatted
        }
      }

      return {
        valid: false,
        message: 'Geçersiz numara formatı. Örn: +90 532 000 00 00 veya 0532 000 00 00',
        formatted: raw
      }
    }
  },

  actions: {
    async fetchSettings() {
      // 0. Sistem ayarlarını (Banner, Bullet'lar, WhatsApp, Kredi maliyetleri) Backend'den çek
      try {
        let settingsData = null
        try {
          const res = await apiClient.get('/admin/settings')
          settingsData = res.data?.data || res.data
        } catch {
          const res = await apiClient.get('/settings')
          settingsData = res.data?.data || res.data
        }

        if (settingsData && typeof settingsData === 'object') {
          this.applyRemoteSettings(settingsData)
        }
      } catch {
        // Sunucu çevrimdışıysa veya endpoint yanıt vermediyse boş bırak
      }

      // 1. Kategorileri, alt kategorileri ve detaylı ilan sayılarını Backend'den çek (GET /api/admin/categories/listing-counts veya fallback /api/categories)
      try {
        let rawCats = null
        try {
          const countRes = await apiClient.get('/admin/categories/listing-counts')
          rawCats = countRes.data?.data || countRes.data
        } catch {
          const catRes = await apiClient.get('/categories')
          rawCats = catRes.data?.data || catRes.data
        }

        if (Array.isArray(rawCats)) {
          this.categories = this.normalizeCategoriesResponse(rawCats)
        } else {
          this.categories = []
        }
      } catch {
        this.categories = []
      }

      // 2. Promosyon fiyatlarını (GET /api/listings/promotion-prices) opsiyonel olarak senkronize et
      try {
        const promoRes = await apiClient.get('/listings/promotion-prices')
        const promoData = promoRes.data?.data || promoRes.data
        if (promoData && typeof promoData === 'object') {
          this.applyRemoteSettings(promoData)
        }
      } catch {
        // ignore
      }
    },

    normalizeCategoriesResponse(rawCats) {
      const seenIds = new Set()
      const flat = []

      const mapItem = (c, idx, fallbackParentId = null, fallbackParentName = null) => {
        const id = c.categoryId ?? c.id
        const rawIcon = c.iconKey || 'sewing'
        const iconType = rawIcon === 'sewing_machine' ? 'sewing' : rawIcon
        const totalListingCount = Number(c.totalListingCount ?? c.listingCount ?? 0)
        const approvedListingCount = Number(c.approvedListingCount ?? c.listingCount ?? 0)
        const pendingListingCount = Number(c.pendingListingCount ?? 0)
        const rejectedListingCount = Number(c.rejectedListingCount ?? 0)
        const parentIdRaw = c.parentId ?? c.ParentId ?? fallbackParentId
        const parentId = parentIdRaw && Number(parentIdRaw) > 0 ? Number(parentIdRaw) : null
        const name = c.categoryName ?? c.name

        if (!seenIds.has(id)) {
          seenIds.add(id)
          flat.push({
            id,
            parentId,
            parentName: c.parentName ?? c.ParentName ?? fallbackParentName ?? null,
            order: c.sortOrder ?? idx + 1,
            name,
            iconType,
            iconSvg: c.iconSvg ?? c.IconSvg ?? '',
            iconColor:
              c.iconColor ||
              c.IconColor ||
              ICON_COLOR_MAP[rawIcon] ||
              ICON_COLOR_MAP[iconType] ||
              '#ea580c',
            listingCount: totalListingCount,
            totalListingCount,
            approvedListingCount,
            pendingListingCount,
            rejectedListingCount,
            isActive: c.isActive ?? true
          })
        }

        const subs = c.subCategories ?? c.SubCategories
        if (Array.isArray(subs) && subs.length > 0) {
          subs.forEach((sub, sIdx) => {
            mapItem(sub, sIdx, id, name)
          })
        }
      }

      rawCats.forEach((c, idx) => mapItem(c, idx, null, null))

      // Ağaç yapısına göre hiyerarşik sırala ve derinlik (depth) ile tam yol (pathLabel) hesapla
      return this.buildHierarchicalList(flat)
    },

    buildHierarchicalList(flatList) {
      const byId = new Map(flatList.map((item) => [Number(item.id), item]))
      const childrenMap = new Map()

      flatList.forEach((item) => {
        const pId =
          item.parentId && byId.has(Number(item.parentId)) ? Number(item.parentId) : null
        item.parentId = pId
        item.parentName = pId ? byId.get(pId)?.name || null : null
        if (!childrenMap.has(pId)) {
          childrenMap.set(pId, [])
        }
        childrenMap.get(pId).push(item)
      })

      // Her seviyedeki kardeşleri kendi sortOrder (order) değerine göre sırala
      for (const list of childrenMap.values()) {
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      }

      const ordered = []
      const visited = new Set()

      const traverse = (parentId, depth, ancestorNames) => {
        const siblings = childrenMap.get(parentId) || []
        siblings.forEach((cat, idx) => {
          if (visited.has(cat.id)) return
          visited.add(cat.id)
          cat.depth = depth
          cat.order = idx + 1
          cat.subCategoryCount = (childrenMap.get(Number(cat.id)) || []).length
          cat.pathLabel = [...ancestorNames, cat.name].join(' › ')
          ordered.push(cat)
          traverse(Number(cat.id), depth + 1, [...ancestorNames, cat.name])
        })
      }

      traverse(null, 0, [])

      // Yetim kalan varsa sona ekle
      flatList.forEach((cat) => {
        if (!visited.has(cat.id)) {
          cat.depth = 0
          cat.subCategoryCount = 0
          cat.pathLabel = cat.name
          ordered.push(cat)
        }
      })

      return ordered
    },

    applyRemoteSettings(data) {
      if (!data) return

      const title = data.bannerTitle ?? data.BannerTitle ?? data.title
      if (title !== undefined) {
        this.banner.title = title
      }

      const imageUrl = data.bannerImageUrl ?? data.BannerImageUrl
      if (imageUrl !== undefined) {
        this.banner.bannerImageUrl = imageUrl
      }

      const whatsapp =
        data.whatsappSupport ??
        data.WhatsappSupport ??
        data.whatsappNumber ??
        data.WhatsappNumber
      if (whatsapp !== undefined) {
        this.banner.whatsappNumber = maskTurkishPhone(whatsapp) || whatsapp
      }

      const whatsappTemplate = data.whatsappTemplate ?? data.WhatsappTemplate
      if (whatsappTemplate !== undefined) {
        this.banner.whatsappTemplate = whatsappTemplate
      }

      // Banner bullet'ları: ya ayrı alanlardan (bullet1/2/3 veya bullets dizisi) ya da bannerSubtitle (' • ' ile ayrılmış) içinden çözümle
      const rawSubtitle = data.bannerSubtitle ?? data.BannerSubtitle ?? data.subtitle
      const rawBullets = data.bullets ?? data.Bullets ?? data.bannerBullets ?? data.BannerBullets

      if (Array.isArray(rawBullets)) {
        this.banner.bullet1 = rawBullets[0] ?? ''
        this.banner.bullet2 = rawBullets[1] ?? ''
        this.banner.bullet3 = rawBullets[2] ?? ''
      } else if (
        data.bullet1 !== undefined ||
        data.bullet2 !== undefined ||
        data.bullet3 !== undefined
      ) {
        this.banner.bullet1 = data.bullet1 ?? ''
        this.banner.bullet2 = data.bullet2 ?? ''
        this.banner.bullet3 = data.bullet3 ?? ''
      } else if (typeof rawSubtitle === 'string') {
        const parts = rawSubtitle
          .split(/\s*(?:•|\||;|\n)\s*/)
          .map((s) => s.trim())
          .filter(Boolean)
        this.banner.bullet1 = parts[0] ?? ''
        this.banner.bullet2 = parts[1] ?? ''
        this.banner.bullet3 = parts[2] ?? ''
      }

      const publishPrice =
        data.listingPublishPriceTl ?? data.ListingPublishPriceTl
      if (publishPrice !== undefined && publishPrice !== null) {
        this.pricing.listingPublishPriceTl = Number(publishPrice)
        this.credits.listingPublishPriceTl = Number(publishPrice)
      }

      const boldPrice =
        data.boldTitlePriceTl ?? data.BoldTitlePriceTl
      if (boldPrice !== undefined && boldPrice !== null) {
        this.pricing.boldTitlePriceTl = Number(boldPrice)
        this.credits.boldTitlePriceTl = Number(boldPrice)
      }

      const featuredPrice =
        data.featuredBoost7DaysPriceTl ?? data.FeaturedBoost7DaysPriceTl
      if (featuredPrice !== undefined && featuredPrice !== null) {
        this.pricing.featuredBoost7DaysPriceTl = Number(featuredPrice)
        this.credits.featuredBoost7DaysPriceTl = Number(featuredPrice)
      }

      const dopingPrice =
        data.doping7DaysPriceTl ?? data.Doping7DaysPriceTl
      if (dopingPrice !== undefined && dopingPrice !== null) {
        this.pricing.doping7DaysPriceTl = Number(dopingPrice)
        this.credits.doping7DaysPriceTl = Number(dopingPrice)
      }

      const storeFee =
        data.storeMonthlySubscriptionFee ?? data.StoreMonthlySubscriptionFee
      if (storeFee !== undefined && storeFee !== null) {
        this.pricing.storeMonthlySubscriptionFee = Number(storeFee)
        this.credits.storeMonthlySubscriptionFee = Number(storeFee)
      }
    },

    /**
     * AdminController:
     * [HttpPut("settings")]
     * UpdateAppSettingsRequestDto:
     * { WhatsappSupport, BannerImageUrl, BannerTitle, BannerSubtitle, ListingPublishCostCredits, FeaturedBoost7DaysCostCredits }
     */
    applyWhatsappMask(rawValue) {
      const masked = maskTurkishPhone(rawValue !== undefined ? rawValue : this.banner.whatsappNumber)
      this.banner.whatsappNumber = masked
      return masked
    },

    formatWhatsappNumber() {
      const check = this.whatsappValidation
      if (check.valid && check.formatted) {
        this.banner.whatsappNumber = check.formatted
      }
    },

    async publishAllSettings() {
      const waCheck = this.whatsappValidation
      if (!waCheck.valid) {
        throw new Error(waCheck.message)
      }

      // Geçerliyse standart formata (+90 5XX XXX XX XX) çevir
      this.banner.whatsappNumber = waCheck.formatted

      this.saving = true
      try {
        const subtitleCombined = [
          this.banner.bullet1,
          this.banner.bullet2,
          this.banner.bullet3
        ]
          .filter(Boolean)
          .join(' • ')

        await apiClient.put('/admin/settings', {
          whatsappSupport: this.banner.whatsappNumber || '',
          bannerImageUrl: this.banner.bannerImageUrl || '',
          bannerTitle: this.banner.title || '',
          bannerSubtitle: subtitleCombined,
          listingPublishPriceTl: Number(this.pricing.listingPublishPriceTl) || 0,
          boldTitlePriceTl: Number(this.pricing.boldTitlePriceTl) || 0,
          featuredBoost7DaysPriceTl: Number(this.pricing.featuredBoost7DaysPriceTl) || 0,
          doping7DaysPriceTl: Number(this.pricing.doping7DaysPriceTl) || 0,
          storeMonthlySubscriptionFee: Number(this.pricing.storeMonthlySubscriptionFee) || 0
        })

        this.lastPublishedAt = new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } finally {
        this.saving = false
      }
    },

    /**
     * AdminController:
     * PATCH /api/admin/settings/store-monthly-fee
     */
    async updateStoreMonthlyFee(newFee) {
      const feeValue = Number(newFee)
      if (Number.isNaN(feeValue) || feeValue < 0) {
        throw new Error('Geçerli bir aylık mağaza abonelik ücreti giriniz.')
      }

      const res = await apiClient.patch('/admin/settings/store-monthly-fee', {
        storeMonthlySubscriptionFee: feeValue,
        fee: feeValue
      })

      const data = res.data?.data || res.data
      if (data?.storeMonthlySubscriptionFee !== undefined) {
        this.pricing.storeMonthlySubscriptionFee = Number(data.storeMonthlySubscriptionFee)
        this.credits.storeMonthlySubscriptionFee = Number(data.storeMonthlySubscriptionFee)
      } else {
        this.pricing.storeMonthlySubscriptionFee = feeValue
        this.credits.storeMonthlySubscriptionFee = feeValue
      }

      return this.pricing.storeMonthlySubscriptionFee
    },

    /**
     * AdminController:
     * [HttpPost("categories")]
     * UpsertCategoryRequestDto: { Name, IconKey, IconSvg, IconColor, SortOrder, IsActive, ParentId }
     */
    async addCategory(payload) {
      const parentId =
        payload.parentId && Number(payload.parentId) > 0 ? Number(payload.parentId) : null
      const siblings = this.categories.filter((c) => (c.parentId || null) === parentId)
      const nextOrder = siblings.length + 1
      const customSvg = (payload.iconSvg || '').trim() || null

      await apiClient.post('/admin/categories', {
        name: payload.name.trim(),
        iconKey: customSvg ? 'custom' : (payload.iconType || 'sewing'),
        iconSvg: customSvg,
        iconColor: payload.iconColor || '#ea580c',
        sortOrder: nextOrder,
        isActive: payload.isActive ?? true,
        parentId
      })

      await this.fetchSettings()
    },

    /**
     * AdminController:
     * [HttpPut("categories/{id:int}")]
     * UpsertCategoryRequestDto: { Name, IconKey, IconSvg, IconColor, SortOrder, IsActive, ParentId }
     */
    async updateCategory(id, payload) {
      const idx = this.categories.findIndex((c) => c.id === id)
      if (idx === -1) return

      this.categories[idx] = {
        ...this.categories[idx],
        ...payload
      }

      const updatedCat = this.categories[idx]
      const numericId = Number(String(id).replace('cat-', ''))
      const customSvg = (updatedCat.iconSvg || '').trim() || null
      const parentId =
        updatedCat.parentId && Number(updatedCat.parentId) > 0
          ? Number(updatedCat.parentId)
          : null

      if (!Number.isNaN(numericId) && numericId > 0) {
        await apiClient.put(`/admin/categories/${numericId}`, {
          name: updatedCat.name,
          iconKey: customSvg ? 'custom' : (updatedCat.iconType || 'sewing'),
          iconSvg: customSvg,
          iconColor: updatedCat.iconColor || '#ea580c',
          sortOrder: updatedCat.order,
          isActive: Boolean(updatedCat.isActive),
          parentId
        })
      }

      await this.fetchSettings()
    },

    async deleteCategory(id) {
      const numericId = Number(String(id).replace('cat-', ''))
      if (!Number.isNaN(numericId) && numericId > 0) {
        try {
          await apiClient.delete(`/admin/categories/${numericId}`)
        } catch {
          // Endpoint yoksa listeden kaldır
        }
      }
      await this.fetchSettings()
    },

    async moveCategory(fromIndex, toIndex) {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= this.categories.length ||
        toIndex >= this.categories.length ||
        fromIndex === toIndex
      ) {
        return
      }

      // Önceki sıralamayı kaydet (sadece sırası değişen kategorilere PUT atmak için)
      const prevOrderMap = new Map(
        this.categories.map((cat) => [cat.id, cat.order])
      )

      const updated = [...this.categories]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      this.categories = updated
      this.normalizeCategoryOrders()

      // Sırası değişen tüm kategorileri PUT /api/admin/categories/{id} ile güncelle
      const changedCategories = this.categories.filter(
        (cat) => prevOrderMap.get(cat.id) !== cat.order
      )

      await Promise.all(
        changedCategories.map(async (cat) => {
          const numericId = Number(String(cat.id).replace('cat-', ''))
          if (!Number.isNaN(numericId) && numericId > 0) {
            try {
              await apiClient.put(`/admin/categories/${numericId}`, {
                name: cat.name,
                iconKey: cat.iconSvg ? 'custom' : (cat.iconType || 'sewing'),
                iconSvg: cat.iconSvg || null,
                iconColor: cat.iconColor || '#ea580c',
                sortOrder: cat.order,
                isActive: Boolean(cat.isActive),
                parentId: cat.parentId || null
              })
            } catch {
              // ignore
            }
          }
        })
      )
    },

    normalizeCategoryOrders() {
      this.categories.forEach((cat, index) => {
        cat.order = index + 1
      })
    }
  }
})
