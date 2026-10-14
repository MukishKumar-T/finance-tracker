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

const TABS = ['Transactions', 'Summary', 'Charts']

const S = {
  header: {
    background: '#111',
    borderBottom: '1px solid #2a2a2a',
    padding: '0 2rem',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '1.35rem',
    color: '#f5c518',
    letterSpacing: '-0.5px',
  },
  logoX: { color: '#f0f0f0' },
  main: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' },
  tabs: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '2rem',
    background: '#161616',
    borderRadius: 10,
    padding: '4px',
    width: 'fit-content',
    border: '1px solid #2a2a2a',
  },
  tab: (active) => ({
    padding: '8px 22px',
    borderRadius: 7,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    background: active ? '#f5c518' : 'transparent',
    color: active ? '#0d0d0d' : '#888',
    transition: 'all .18s',
  }),
  card: {
    background: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,.5)',
  },
  cardTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#f0f0f0',
    marginBottom: '1rem',
  },
}

export default function App() {
  const [tab, setTab] = useState('Transactions')
  const [filters, setFilters] = useState({})
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast, showToast, clearToast } = useToast()

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const handleFiltersChange = useCallback((f) => setFilters(f), [])

  useEffect(() => {
    setLoading(true)
    listTransactions(filters)
      .then(setData)
      .catch((err) => showToast(err.message || 'Failed to load transactions.', 'error'))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => {
    const id = setInterval(refresh, 20000)
    return () => clearInterval(id)
  }, [refresh])

  return (
    <>
      <header style={S.header}>
        <span style={S.logo}>
          <span style={S.logoX}>X</span>penseSlate
        </span>
        <span style={{ fontSize: '0.75rem', color: '#555' }}>Personal Finance Tracker</span>
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
              <div style={S.cardTitle}>Transactions</div>
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
