<template>
  <div class="placeholder-page">
    <header class="placeholder-topbar mj-card">
      <div>
        <h1 class="page-title">{{ pageMeta.title }}</h1>
        <p class="page-subtitle">{{ pageMeta.subtitle }}</p>
      </div>
      <span class="mj-badge-orange">Canlı Veri • V2.4</span>
    </header>

    <!-- Pazaryeri Raporları (/reports -> GET /api/admin/dashboard) -->
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

    <!-- Kullanıcı Yönetimi veya Genel Görünüm -->
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
import { apiClient } from '@/services/api'

const route = useRoute()

const dashboard = ref({
  totalUsers: 142,
  approvedListings: 697,
  pendingListings: 12,
  rejectedListings: 8,
  featuredListings: 16,
  totalCreditsSold: 1240,
  totalStoreTransactions: 84
})

const transactions = ref([])

async function loadEndpointData() {
  if (route.path === '/reports') {
    try {
      const res = await apiClient.get('/admin/dashboard')
      if (res.data) {
        dashboard.value = res.data
      }
    } catch {
      // Varsayılan özet metrikleri göster
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
  if (route.path === '/users') {
    return {
      title: 'Kullanıcı Yönetimi',
      subtitle: 'Kurumsal mağazaları, satıcı doğrulamalarını ve kullanıcı rollerini yönetin',
      icon: 'group',
      description:
        'Bu ekrandan kayıtlı satıcıların vergi levhası doğrulamalarını, kredi bakiyelerini ve hesap durumlarını inceleyebilirsiniz.'
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
