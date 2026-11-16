import { defineStore } from 'pinia'
import { apiClient } from '@/services/api'
import { INITIAL_SYSTEM_SETTINGS } from '@/services/mockData'

const SETTINGS_STORAGE_KEY = 'mj_admin_system_settings_v24'

const ICON_COLOR_MAP = {
  sewing: '#ea580c',
  overlock: '#0284c7',
  coverstitch: '#0f172a',
  buttonhole: '#f07419',
  cutting: '#0284c7',
  spareparts: '#16a34a'
}

function loadInitialSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return structuredClone(INITIAL_SYSTEM_SETTINGS)
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const initial = loadInitialSettings()
    return {
      banner: initial.banner,
      categories: initial.categories,
      credits: initial.credits,
      creditPackages: [],
      transactions: [],
      saving: false,
      lastPublishedAt: '16 Kasım 2026, 16:30'
    }
  },

  getters: {
    showcasePriceTl(state) {
      const credits = Number(state.credits.showcase7DaysCredits) || 0
      const unitPrice = Number(state.credits.creditUnitPriceTl) || 0
      return credits * unitPrice
    }
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({
            banner: this.banner,
            categories: this.categories,
            credits: this.credits
          })
        )
      } catch {
        // ignore
      }
    },

    async fetchSettings() {
      // 1. Kategorileri Backend'den çekmeyi dene (GET /api/categories)
      try {
        const catRes = await apiClient.get('/categories')
        const rawCats = catRes.data?.data || catRes.data
        if (Array.isArray(rawCats) && rawCats.length > 0) {
          this.categories = rawCats.map((c, idx) => {
            const iconType = c.iconKey || 'sewing'
            return {
              id: c.id,
              order: c.sortOrder ?? idx + 1,
              name: c.name,
              iconType,
              iconColor: ICON_COLOR_MAP[iconType] || '#ea580c',
              listingCount: c.listingCount ?? 0,
              isActive: c.isActive ?? true
            }
          })
          this.persist()
        }
      } catch {
        // Yerel kategorileri koru
      }

      // 2. Kredi paketlerini AdminController üzerinden çek (GET /api/admin/credit-packages)
      try {
        const pkgRes = await apiClient.get('/admin/credit-packages')
        if (Array.isArray(pkgRes.data)) {
          this.creditPackages = pkgRes.data
        }
      } catch {
        // Yetki veya sunucu hazır değilse yerel veriyi koru
      }
    },

    /**
     * AdminController:
     * [HttpPut("settings")]
     * UpdateAppSettingsRequestDto:
     * { WhatsappSupport, BannerImageUrl, BannerTitle, BannerSubtitle, ListingPublishCostCredits, FeaturedBoost7DaysCostCredits }
     */
    async publishAllSettings() {
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
          bannerImageUrl: this.banner.bannerImageUrl || 'https://makinajet.com/assets/hero-banner.png',
          bannerTitle: this.banner.title || '',
          bannerSubtitle: subtitleCombined,
          listingPublishCostCredits: Number(this.credits.standardListingCredits) || 1,
          featuredBoost7DaysCostCredits: Number(this.credits.showcase7DaysCredits) || 5
        })
      } catch (err) {
        console.warn('Settings API bilgi:', err?.message)
      } finally {
        this.persist()
        this.lastPublishedAt = new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        this.saving = false
      }
    },

    /**
     * AdminController:
     * [HttpPost("categories")]
     * UpsertCategoryRequestDto: { Name, IconKey, SortOrder, IsActive }
     */
    async addCategory(payload) {
      const nextOrder = this.categories.length + 1
      let createdId = `cat-${Date.now()}`

      try {
        const res = await apiClient.post('/admin/categories', {
          name: payload.name.trim(),
          iconKey: payload.iconType || 'sewing',
          sortOrder: nextOrder,
          isActive: payload.isActive ?? true
        })
        if (res.data?.id) {
          createdId = res.data.id
        }
      } catch {
        // Yerel olarak eklemeye devam et
      }

      this.categories.push({
        id: createdId,
        order: nextOrder,
        name: payload.name,
        iconType: payload.iconType || 'sewing',
        iconColor: payload.iconColor || '#ea580c',
        listingCount: Number(payload.listingCount) || 0,
        isActive: payload.isActive ?? true
      })
      this.normalizeCategoryOrders()
      this.persist()
    },

    /**
     * AdminController:
     * [HttpPut("categories/{id:int}")]
     * UpsertCategoryRequestDto: { Name, IconKey, SortOrder, IsActive }
     */
    async updateCategory(id, payload) {
      const idx = this.categories.findIndex((c) => c.id === id)
      if (idx === -1) return

      this.categories[idx] = {
        ...this.categories[idx],
        ...payload
      }
      this.persist()

      const updatedCat = this.categories[idx]
      const numericId = Number(String(id).replace('cat-', ''))

      if (!Number.isNaN(numericId) && numericId > 0 && numericId < 100000) {
        try {
          await apiClient.put(`/admin/categories/${numericId}`, {
            name: updatedCat.name,
            iconKey: updatedCat.iconType || 'sewing',
            sortOrder: updatedCat.order,
            isActive: Boolean(updatedCat.isActive)
          })
        } catch {
          // ignore
        }
      }
    },

    deleteCategory(id) {
      this.categories = this.categories.filter((c) => c.id !== id)
      this.normalizeCategoryOrders()
      this.persist()
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
      const updated = [...this.categories]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      this.categories = updated
      this.normalizeCategoryOrders()
      this.persist()

      const movedNumericId = Number(String(moved.id).replace('cat-', ''))
      if (!Number.isNaN(movedNumericId) && movedNumericId > 0 && movedNumericId < 100000) {
        try {
          await apiClient.put(`/admin/categories/${movedNumericId}`, {
            name: moved.name,
            iconKey: moved.iconType || 'sewing',
            sortOrder: moved.order,
            isActive: Boolean(moved.isActive)
          })
        } catch {
          // ignore
        }
      }
    },

    normalizeCategoryOrders() {
      this.categories.forEach((cat, index) => {
        cat.order = index + 1
      })
    }
  }
})
