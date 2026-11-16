import { defineStore } from 'pinia'
import { apiClient } from '@/services/api'
import { INITIAL_PENDING_LISTINGS, REJECTION_REASONS } from '@/services/mockData'

const STORAGE_KEY = 'mj_admin_pending_listings_v24'

function formatRelativeTime(date) {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMins < 60) return `${diffMins} dk önce`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} saat önce`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} gün önce`
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
  const mappedPhotos =
    rawImages.length > 0
      ? rawImages.map((img, idx) => ({
          id: img.id || `img-${idx}`,
          label: idx === 0 ? 'Kapak Fotoğrafı' : `Fotoğraf ${idx + 1}`,
          topBadge: img.isCover || idx === 0 ? 'Kapak Fotoğrafı' : null,
          resolution: 'Orijinal Boyut • Net',
          title: `${dto.title} — Fotoğraf ${idx + 1}`,
          url: img.imageUrl
        }))
      : INITIAL_PENDING_LISTINGS[0].photos

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
    sellerApprovedCount: 1,
    sellerComplaintCount: 0,
    price: priceNum,
    formattedPrice,
    condition: conditionText,
    conditionDetail: isNew ? 'Sıfır Fabrika Çıkışlı' : 'İkinci El',
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
    status: 'Pending',
    isFeatured: Boolean(dto.isFeatured),
    featuredUntil: dto.featuredUntil || null,
    description: dto.description || 'Açıklama metni bulunmuyor.',
    thumbnail: mappedPhotos[0]?.url || INITIAL_PENDING_LISTINGS[0].thumbnail,
    photos: mappedPhotos,
    isFromBackend: true
  }
}

function loadInitialListings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return structuredClone(INITIAL_PENDING_LISTINGS)
}

export const useModerationStore = defineStore('moderation', {
  state: () => {
    const initial = loadInitialListings()
    return {
      listings: initial,
      selectedId: initial[0]?.id || null,
      searchQuery: '',
      conditionFilter: 'ALL', // 'ALL' | 'Sıfır' | 'İkinci El'
      loading: false,
      rejectionReasons: REJECTION_REASONS,
      totalCountFromApi: null,
      dashboardStats: null,
      actionHistory: []
    }
  },

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
      const activeCount = state.listings.filter((i) => i.status === 'Pending').length
      return activeCount > 0 ? activeCount + 8 : 0
    }
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.listings))
      } catch {
        // ignore
      }
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
    async fetchPendingListings(resetDemo = false) {
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

        if (Array.isArray(rawItems) && rawItems.length > 0) {
          this.listings = rawItems.map((dto) => mapApiListingToUi(dto))
          this.totalCountFromApi = pagedData.totalCount ?? pagedData.TotalCount ?? this.listings.length
          this.selectedId = this.listings[0]?.id || null
          this.persist()
          return
        }
      } catch {
        // Backend 401 döndürürse veya boşsa demo listesini koru
      } finally {
        this.loading = false
      }

      if (resetDemo || this.pendingListings.length === 0) {
        this.listings = structuredClone(INITIAL_PENDING_LISTINGS)
        this.totalCountFromApi = null
        this.selectedId = this.listings[0]?.id || null
        this.persist()
      }
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/approve")]
     */
    async approveListing(id) {
      const target = this.listings.find((item) => item.id === id)
      if (!target) return

      if (target.isFromBackend) {
        try {
          await apiClient.patch(`/admin/listings/${id}/approve`)
        } catch (err) {
          console.warn('Approve API uyarısı:', err)
        }
      }

      target.status = 'Approved'
      if (typeof this.totalCountFromApi === 'number' && this.totalCountFromApi > 0) {
        this.totalCountFromApi -= 1
      }

      this.actionHistory.unshift({
        id: Date.now(),
        code: target.code,
        title: target.title,
        action: 'Onaylandı',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      })

      this.selectNextAvailable(id)
      this.persist()
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/reject")]
     * Body: RejectListingRequestDto { RejectReason }
     */
    async rejectListing(id, { reason, note }) {
      const target = this.listings.find((item) => item.id === id)
      if (!target) return

      const combinedReason = [reason, note?.trim()].filter(Boolean).join(' — ')

      if (target.isFromBackend) {
        try {
          await apiClient.patch(`/admin/listings/${id}/reject`, {
            rejectReason: combinedReason
          })
        } catch (err) {
          console.warn('Reject API uyarısı:', err)
        }
      }

      target.status = 'Rejected'
      target.rejectionReason = reason
      target.rejectionNote = note

      if (typeof this.totalCountFromApi === 'number' && this.totalCountFromApi > 0) {
        this.totalCountFromApi -= 1
      }

      this.actionHistory.unshift({
        id: Date.now(),
        code: target.code,
        title: target.title,
        action: `Reddedildi (${reason})`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      })

      this.selectNextAvailable(id)
      this.persist()
    },

    /**
     * AdminController:
     * [HttpPatch("listings/{id:guid}/set-featured")]
     * Body: SetFeaturedRequestDto { DurationDays }
     */
    async toggleFeatureListing(id, durationDays = 7) {
      const target = this.listings.find((item) => item.id === id)
      if (!target) return false

      const nextFeatured = !target.isFeatured

      if (target.isFromBackend) {
        try {
          await apiClient.patch(`/admin/listings/${id}/set-featured`, {
            durationDays: nextFeatured ? durationDays : 0
          })
        } catch (err) {
          console.warn('Set-featured API uyarısı:', err)
        }
      }

      target.isFeatured = nextFeatured
      this.persist()
      return target.isFeatured
    },

    selectNextAvailable(removedId) {
      const remaining = this.pendingListings.filter((item) => item.id !== removedId)
      this.selectedId = remaining[0]?.id || null
    }
  }
})
