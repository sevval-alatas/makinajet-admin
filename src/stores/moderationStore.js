import { defineStore } from 'pinia'
import { apiClient, API_BASE_URL } from '@/services/api'

const REJECTION_REASONS = [
  'Fotoğraflar kalitesiz / bulanık',
  'Eksik veya hatalı fiyat bilgisi',
  'Kategori / marka-model uyumsuzluğu',
  'Makine etiketi veya seri numarası okunmuyor',
  'Açıklamada yasaklı iletişim / reklam bilgisi',
  'Mükerrer veya sahte ilan şüphesi'
]

function resolveImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return ''
  const trimmed = rawUrl.trim()
  if (!trimmed) return ''
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }
  const base = API_BASE_URL.replace(/\/$/, '')
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`
}

function formatRelativeTime(date) {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMins < 60) return `${diffMins} dk önce`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} saat önce`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} gün önce`
}

function normalizeStatus(rawStatus) {
  const s = String(rawStatus ?? '').toLowerCase()
  if (s === '0' || s === 'pending' || s.includes('bekliyor')) return 'Pending'
  if (s === '1' || s === 'approved' || s === 'active' || s.includes('yayın')) return 'Approved'
  if (s === '2' || s === 'rejected' || s.includes('red')) return 'Rejected'
  if (s === '3' || s === 'sold' || s.includes('satıl')) return 'Sold'
  if (
    s === '4' ||
    s === 'passive' ||
    s === 'inactive' ||
    s === 'expired' ||
    s === 'removed' ||
    s === 'deleted' ||
    s === 'archived' ||
    s.includes('kaldır') ||
    s.includes('pasif')
  ) {
    return 'Passive'
  }
  return rawStatus || 'Pending'
}

function getStatusLabel(status) {
  if (status === 'Approved') return 'Yayında'
  if (status === 'Rejected') return 'Reddedildi (Arşiv)'
  if (status === 'Sold') return 'Satıldı'
  if (status === 'Passive') return 'Kaldırıldı / Pasif (Arşiv)'
  return 'Onay Bekliyor'
}

export function isArchivedListingStatus(status) {
  return status === 'Rejected' || status === 'Passive'
}

function mapApiListingToUi(dto) {
  const rawCond = String(dto.condition ?? '').toLowerCase()
  const isNew =
    rawCond === '0' ||
    rawCond.includes('new') ||
    rawCond.includes('sifir') ||
    rawCond.includes('sıfır')
  const conditionText = isNew ? 'Sıfır' : 'İkinci El'

  const priceNum = Number(dto.price) || 0
  const formattedPrice = '₺' + priceNum.toLocaleString('tr-TR')

  const shortCode = `#MJ-${String(dto.id).slice(0, 5).toUpperCase()}`
  const createdDate = dto.createdAt ? new Date(dto.createdAt) : new Date()

  const rawImages = Array.isArray(dto.images) ? dto.images : []
  const mappedPhotos = rawImages.map((img, idx) => ({
    id: img.id || `img-${idx}`,
    label: idx === 0 ? 'Kapak Fotoğrafı' : `Fotoğraf ${idx + 1}`,
    topBadge: img.isCover || idx === 0 ? 'Kapak Fotoğrafı' : null,
    resolution: 'Orijinal Boyut • Net',
    title: `${dto.title} — Fotoğraf ${idx + 1}`,
    url: resolveImageUrl(img.imageUrl || img.url)
  }))

  const normalizedStatus = normalizeStatus(dto.status ?? dto.Status)

  return {
    id: dto.id,
    code: shortCode,
    title: dto.title,
    fullTitle: dto.title,
    sellerName: dto.seller?.fullName || 'Satıcı',
    sellerFullTitle: dto.seller?.fullName || 'MakinaJet Satıcısı',
    sellerTaxNo: dto.seller?.city ? `Şehir: ${dto.seller.city}` : 'Doğrulanmış Üye',
    sellerPhone: dto.contactPhone || dto.seller?.phone || '-',
    sellerVerified: true,
    sellerApprovedCount: dto.seller?.approvedListingCount ?? 0,
    sellerComplaintCount: dto.seller?.complaintCount ?? 0,
    price: priceNum,
    formattedPrice,
    condition: conditionText,
    conditionDetail: isNew ? 'Sıfır Fabrika Çıkışlı' : 'İkinci El',
    categoryId: dto.categoryId ?? dto.CategoryId ?? null,
    category: dto.categoryName || 'Tekstil Makinesi',
    brand: dto.brand || '-',
    model: dto.model || '-',
    location:
      [dto.city, dto.district].filter(Boolean).join(' / ') ||
      dto.seller?.city ||
      'Türkiye',
    relativeTime: formatRelativeTime(createdDate),
    createdAtFormatted: createdDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: normalizedStatus,
    statusLabel: getStatusLabel(normalizedStatus),
    rejectReason: dto.rejectReason || dto.rejectionReason || null,
    isFeatured: Boolean(dto.isFeatured),
    featuredUntil: dto.featuredUntil || null,
    hasDoping: Boolean(dto.hasDoping ?? dto.isDoping),
    dopingUntil: dto.dopingUntil || null,
    isBoldTitle: Boolean(dto.isBoldTitle ?? dto.hasBoldTitle),
    boldTitleUntil: dto.boldTitleUntil || null,
    totalPaidAmountTl: Number(dto.totalPaidAmountTl ?? 0),
    description: dto.description || 'Açıklama metni bulunmuyor.',
    thumbnail: mappedPhotos[0]?.url || '',
    photos: mappedPhotos,
    isFromBackend: true
  }
}

export const useModerationStore = defineStore('moderation', {
  state: () => ({
    listings: [],
    selectedId: null,
    searchQuery: '',
    conditionFilter: 'ALL', // 'ALL' | 'Sıfır' | 'İkinci El'
    loading: false,
    rejectionReasons: REJECTION_REASONS,
    totalCountFromApi: null,
    dashboardStats: null,
    actionHistory: [],

    // Tüm İlanlar sayfası state'i
    allListings: [],
    allListingsTotalCount: 0,
    allListingsLoading: false,
    allListingsStatusFilter: 'ALL', // 'ALL' | 'Pending' | 'Approved' | 'Rejected' | 'Sold' | 'Passive'
    allListingsSearch: '',
    allListingsPage: 1,
    allListingsPageSize: 50
  }),

  getters: {
    pendingListings(state) {
      return state.listings.filter((item) => item.status === 'Pending')
    },

    filteredListings() {
      const q = this.searchQuery.trim().toLowerCase()
      return this.pendingListings.filter((item) => {
        const matchesCondition =
          this.conditionFilter === 'ALL' || item.condition === this.conditionFilter
        if (!matchesCondition) return false
        if (!q) return true
        return (
          item.code.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.fullTitle.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q)
        )
      })
    },

    selectedListing(state) {
      return (
        state.listings.find((item) => item.id === state.selectedId && item.status === 'Pending') ||
        this.filteredListings[0] ||
        null
      )
    },

    totalPendingBadgeCount(state) {
      if (typeof state.totalCountFromApi === 'number') {
        return state.totalCountFromApi
      }
      return state.listings.filter((i) => i.status === 'Pending').length
    }
  },

  actions: {
    clearActionHistory() {
      this.actionHistory = []
    },

    selectListing(id) {
      this.selectedId = id
    },

    async fetchDashboardStats() {
      try {
        // GET /api/admin/dashboard
        const res = await apiClient.get('/admin/dashboard')
        if (res.data) {
          this.dashboardStats = res.data
          if (typeof res.data.pendingListings === 'number') {
            this.totalCountFromApi = res.data.pendingListings
          }
        }
      } catch {
        // JWT yetkisi veya sunucu hazır değilse sessizce geç
      }
    },

    /**
     * AdminController:
     * [HttpGet("listings")]
     * GetListings([FromQuery] ListingStatus? status, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
     */
    async fetchPendingListings() {
      this.loading = true
      try {
        const res = await apiClient.get('/admin/listings', {
          params: {
            status: 'Pending',
            search: this.searchQuery.trim() || undefined,
            page: 1,
            pageSize: 50
          }
        })

        const pagedData = res.data
        const rawItems = pagedData?.items || pagedData?.Items || []

        if (Array.isArray(rawItems)) {
          this.listings = rawItems.map((dto) => mapApiListingToUi(dto))
          this.totalCountFromApi = pagedData.totalCount ?? pagedData.TotalCount ?? this.listings.length
          this.selectedId = this.listings[0]?.id || null
        } else {
          this.listings = []
          this.totalCountFromApi = 0
          this.selectedId = null
        }
      } catch {
        this.listings = []
        this.totalCountFromApi = 0
        this.selectedId = null
      } finally {
        this.loading = false
      }
    },

    /**
     * Sistemdeki tüm ilanları (veya seçili duruma göre) getirir:
     * GET /api/admin/listings?status=...&search=...&page=...&pageSize=...
     */
    async fetchAllListings() {
      this.allListingsLoading = true
      try {
        // 'ALL' ve 'ARCHIVE' modlarında tüm kayıtları çekip aktif/arşiv ayrımını uygula
        const statusParam =
          this.allListingsStatusFilter &&
          this.allListingsStatusFilter !== 'ALL' &&
          this.allListingsStatusFilter !== 'ARCHIVE'
            ? this.allListingsStatusFilter
            : undefined

        const res = await apiClient.get('/admin/listings', {
          params: {
            status: statusParam,
            search: this.allListingsSearch.trim() || undefined,
            page: this.allListingsPage,
            pageSize: 100
          }
        })

        const pagedData = res.data
        const rawItems = pagedData?.items || pagedData?.Items || (Array.isArray(pagedData) ? pagedData : [])

        if (Array.isArray(rawItems)) {
          this.allListings = rawItems.map((dto) => mapApiListingToUi(dto))
          this.allListingsTotalCount =
            pagedData?.totalCount ?? pagedData?.TotalCount ?? this.allListings.length
        } else {
          this.allListings = []
          this.allListingsTotalCount = 0
        }
      } catch {
        this.allListings = []
        this.allListingsTotalCount = 0
      } finally {
        this.allListingsLoading = false
      }
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/approve")]
     */
    async approveListing(id) {
      const target = this.listings.find((item) => item.id === id)
      const allTarget = this.allListings.find((item) => item.id === id)
      const refItem = target || allTarget

      if (refItem && isArchivedListingStatus(refItem.status)) {
        throw new Error('Arşivdeki (reddedilen veya kaldırılan) ilanlar tekrar onaylanamaz.')
      }

      await apiClient.patch(`/admin/listings/${id}/approve`)

      if (target) {
        target.status = 'Approved'
        target.statusLabel = 'Yayında'
      }
      if (allTarget) {
        allTarget.status = 'Approved'
        allTarget.statusLabel = 'Yayında'
      }

      if (typeof this.totalCountFromApi === 'number' && this.totalCountFromApi > 0) {
        this.totalCountFromApi -= 1
      }

      if (refItem) {
        this.actionHistory.unshift({
          id: Date.now(),
          code: refItem.code,
          title: refItem.title,
          action: 'Onaylandı',
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        })
      }

      if (target) {
        this.selectNextAvailable(id)
      }
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/reject")]
     * Body: RejectListingRequestDto { RejectReason }
     */
    async rejectListing(id, { reason, note }) {
      const combinedReason = [reason, note?.trim()].filter(Boolean).join(' — ')

      await apiClient.patch(`/admin/listings/${id}/reject`, {
        rejectReason: combinedReason
      })

      const target = this.listings.find((item) => item.id === id)
      const allTarget = this.allListings.find((item) => item.id === id)

      if (target) {
        target.status = 'Rejected'
        target.statusLabel = 'Reddedildi'
        target.rejectionReason = reason
        target.rejectionNote = note
        target.rejectReason = combinedReason
      }
      if (allTarget) {
        allTarget.status = 'Rejected'
        allTarget.statusLabel = 'Reddedildi'
        allTarget.rejectReason = combinedReason
      }

      if (typeof this.totalCountFromApi === 'number' && this.totalCountFromApi > 0) {
        this.totalCountFromApi -= 1
      }

      const refItem = target || allTarget
      if (refItem) {
        this.actionHistory.unshift({
          id: Date.now(),
          code: refItem.code,
          title: refItem.title,
          action: `Reddedildi (${reason})`,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        })
      }

      if (target) {
        this.selectNextAvailable(id)
      }
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/set-featured")]
     * Body: SetFeaturedRequestDto { DurationDays }
     */
    async toggleFeatureListing(id, durationDays = 7) {
      const target = this.listings.find((item) => item.id === id)
      const allTarget = this.allListings.find((item) => item.id === id)
      const refItem = target || allTarget
      if (!refItem) return false

      if (isArchivedListingStatus(refItem.status)) {
        throw new Error('Arşivdeki (reddedilen veya kaldırılan) ilanlar vitrine eklenemez.')
      }

      const nextFeatured = !refItem.isFeatured

      await apiClient.patch(`/admin/listings/${id}/set-featured`, {
        durationDays: nextFeatured ? durationDays : 0
      })

      if (target) target.isFeatured = nextFeatured
      if (allTarget) allTarget.isFeatured = nextFeatured
      return nextFeatured
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/set-doping")]
     * Body: { durationDays }
     */
    async toggleDopingListing(id, durationDays = 7) {
      const target = this.listings.find((item) => item.id === id)
      const allTarget = this.allListings.find((item) => item.id === id)
      const refItem = target || allTarget
      if (!refItem) return false

      if (isArchivedListingStatus(refItem.status)) {
        throw new Error('Arşivdeki (reddedilen veya kaldırılan) ilanlara doping eklenemez.')
      }

      const nextDoping = !refItem.hasDoping

      await apiClient.patch(`/admin/listings/${id}/set-doping`, {
        durationDays: nextDoping ? durationDays : 0
      })

      if (target) target.hasDoping = nextDoping
      if (allTarget) allTarget.hasDoping = nextDoping
      return nextDoping
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/set-bold-title")]
     * Body: { durationDays }
     */
    async toggleBoldTitleListing(id, durationDays = 7) {
      const target = this.listings.find((item) => item.id === id)
      const allTarget = this.allListings.find((item) => item.id === id)
      const refItem = target || allTarget
      if (!refItem) return false

      if (isArchivedListingStatus(refItem.status)) {
        throw new Error('Arşivdeki (reddedilen veya kaldırılan) ilanlara kalın yazı eklenemez.')
      }

      const nextBold = !refItem.isBoldTitle

      await apiClient.patch(`/admin/listings/${id}/set-bold-title`, {
        durationDays: nextBold ? durationDays : 0
      })

      if (target) target.isBoldTitle = nextBold
      if (allTarget) allTarget.isBoldTitle = nextBold
      return nextBold
    },

    selectNextAvailable(removedId) {
      const remaining = this.pendingListings.filter((item) => item.id !== removedId)
      this.selectedId = remaining[0]?.id || null
    }
  }
})
