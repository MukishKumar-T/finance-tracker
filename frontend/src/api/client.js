import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Normalise errors so components can always read error.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') {
      err.message = detail
    } else if (Array.isArray(detail)) {
      err.message = detail.map((d) => d.msg).join('; ')
    }
    return Promise.reject(err)
  }
)

export const createTransaction = (payload) =>
  api.post('/transactions/', payload).then((r) => r.data)

export const listTransactions = (filters = {}) => {
  const params = {}
  if (filters.month) params.month = filters.month
  if (filters.type) params.type = filters.type
  if (filters.category) params.category = filters.category
  if (filters.skip !== undefined) params.skip = filters.skip
  if (filters.limit !== undefined) params.limit = filters.limit
  return api.get('/transactions/', { params }).then((r) => r.data)
}

export const getSummary = (month) => {
  const params = month ? { month } : {}
  return api.get('/transactions/summary', { params }).then((r) => r.data)
}

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`)

export const reclassifyTransaction = (id, category) =>
  api.patch(`/transactions/${id}/reclassify`, { category }).then((r) => r.data)
