import axios from 'axios'
import { lerSessao, limparSessao } from './session'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

// Anexa o token JWT em toda requisicao
api.interceptors.request.use((config) => {
  const sessao = lerSessao()
  if (sessao?.token) config.headers.Authorization = `Bearer ${sessao.token}`
  return config
})

// Token expirado/invalido (401): limpa a sessao e volta ao login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const ehLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !ehLogin) {
      limparSessao()
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)

export default api
