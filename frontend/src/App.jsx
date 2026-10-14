import { useState, useEffect, useCallback } from 'react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Filters from './components/Filters'
import MonthlySummary from './components/MonthlySummary'
import ExpensePieChart from './components/ExpensePieChart'
import MonthlyBarChart from './components/MonthlyBarChart'
import Toast from './components/Toast'
import useToast from './components/useToast'
import { listTransactions } from './api/client'

const S = {
  header: { background: '#1a1a2e', color: '#fff', padding: '1rem 2rem', marginBottom: '1.5rem' },
  main: { maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: (active) => ({
    padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600,
    background: active ? '#4f8ef7' : '#e2e8f0',
    color: active ? '#fff' : '#333',
  }),
}

const TABS = ['Transactions', 'Summary', 'Charts']

export default function App() {
  const [tab, setTab] = useState('Transactions')
  const [filters, setFilters] = useState({})
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast, showToast, clearToast } = useToast()

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const handleFiltersChange = useCallback((f) => {
    setFilters(f)
  }, [])

  useEffect(() => {
    setLoading(true)
    listTransactions(filters)
      .then(setData)
      .catch((err) => showToast(err.message || 'Failed to load transactions.', 'error'))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  // Poll every 20 seconds
  useEffect(() => {
    const id = setInterval(refresh, 20000)
    return () => clearInterval(id)
  }, [refresh])

  return (
    <>
      <header style={S.header}>
        <h1 style={{ fontSize: '1.3rem' }}>💰 Personal Finance Tracker</h1>
      </header>
      <main style={S.main}>
        <div style={S.tabs}>
          {TABS.map((t) => (
            <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Transactions' && (
          <>
            <TransactionForm onCreated={refresh} showToast={showToast} />
            <div style={S.card}>
              <h2 style={{ marginBottom: '1rem' }}>Transactions</h2>
              <Filters filters={filters} onChange={handleFiltersChange} />
              <TransactionList
                data={data}
                loading={loading}
                onRefresh={refresh}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                showToast={showToast}
              />
            </div>
          </>
        )}

        {tab === 'Summary' && <MonthlySummary refreshKey={refreshKey} />}

        {tab === 'Charts' && (
          <>
            <MonthlyBarChart refreshKey={refreshKey} />
            <ExpensePieChart refreshKey={refreshKey} />
          </>
        )}
      </main>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </>
  )
}
