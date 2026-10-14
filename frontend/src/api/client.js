import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Normalise errors so components can always read err.message
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
  if (filters.month)     params.month     = filters.month
  if (filters.type)      params.type      = filters.type
  if (filters.category)  params.category  = filters.category
  if (filters.search)    params.search    = filters.search
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to)   params.date_to   = filters.date_to
  if (filters.sort_by)   params.sort_by   = filters.sort_by
  if (filters.sort_dir)  params.sort_dir  = filters.sort_dir
  if (filters.skip  !== undefined) params.skip  = filters.skip
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

export const exportCSV = (filters = {}) => {
  const params = {}
  if (filters.month)     params.month     = filters.month
  if (filters.type)      params.type      = filters.type
  if (filters.category)  params.category  = filters.category
  if (filters.search)    params.search    = filters.search
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to)   params.date_to   = filters.date_to
  return api.get('/transactions/export', { params, responseType: 'blob' }).then((r) => {
    const url = window.URL.createObjectURL(new Blob([r.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  })
}
