import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5083'

// Geliştirme ortamında (localhost:5173) tarayıcı CORS hatasını önlemek için
// istekleri Vite Proxy ('/api' -> 'http://localhost:5083/api') üzerinden geçiriyoruz.
const baseURL = import.meta.env.DEV ? '/api' : `${API_BASE_URL}/api`

export const apiClient = axios.create({
  baseURL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Her istekte JWT Bearer Token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mj_admin_token') || sessionStorage.getItem('mj_admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 401/403 durumlarında oturum yönetimi (Demo imzalı JWT kullanılıyorsa oturumu silme)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('mj_admin_token') || sessionStorage.getItem('mj_admin_token') || ''
      if (!token.endsWith('makinajet_v24_signature')) {
        localStorage.removeItem('mj_admin_token')
        sessionStorage.removeItem('mj_admin_token')
      }
    }
    return Promise.reject(error)
  }
)

export { API_BASE_URL }
