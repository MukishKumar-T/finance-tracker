import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Filters from './components/Filters'
import MonthlySummary from './components/MonthlySummary'
import ExpensePieChart from './components/ExpensePieChart'
import MonthlyBarChart from './components/MonthlyBarChart'
import Toast from './components/Toast'
import useToast from './components/useToast'
import AddTransactionModal from './components/AddTransactionModal'
import { listTransactions } from './api/client'

const TABS = ['Dashboard', 'Transactions', 'Summary', 'Charts']

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
  const [tab, setTab] = useState('Dashboard')
  const [filters, setFilters] = useState({})
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const { toast, showToast, clearToast } = useToast()

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const handleFiltersChange = useCallback((f) => setFilters(f), [])

  // Navigate to a tab from Dashboard quick-links
  const handleNavigate = useCallback((targetTab) => setTab(targetTab), [])

  useEffect(() => {
    if (tab !== 'Transactions') return
    setLoading(true)
    listTransactions(filters)
      .then(setData)
      .catch((err) => showToast(err.message || 'Failed to load transactions.', 'error'))
      .finally(() => setLoading(false))
  }, [filters, refreshKey, tab])

  // Poll every 20 seconds
  useEffect(() => {
    const id = setInterval(refresh, 20000)
    return () => clearInterval(id)
  }, [refresh])

  return (
    <>
      <header style={S.header}>
        <span style={S.logo} onClick={() => setTab('Dashboard')} role="button" title="Go to Dashboard">
          <span style={S.logoX}>X</span>penseSlate
        </span>
        <span style={{ fontSize: '0.75rem', color: '#555' }}>Personal Finance Tracker</span>
      </header>

      <main style={S.main}>
        {/* Tab bar + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={S.tabs}>
            {TABS.map((t) => (
              <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: '#f5c518', color: '#0d0d0d',
              border: 'none', borderRadius: 8,
              padding: '9px 20px', fontWeight: 700,
              fontSize: '0.9rem', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 0 16px rgba(245,197,24,.25)',
              cursor: 'pointer',
              transition: 'box-shadow .2s',
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>＋</span> Add Transaction
          </button>
        </div>

        {/* Dashboard */}
        {tab === 'Dashboard' && (
          <Dashboard onNavigate={handleNavigate} refreshKey={refreshKey} />
        )}

        {/* Transactions */}
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

        {/* Summary */}
        {tab === 'Summary' && <MonthlySummary refreshKey={refreshKey} />}

        {/* Charts */}
        {tab === 'Charts' && (
          <>
            <MonthlyBarChart refreshKey={refreshKey} />
            <ExpensePieChart refreshKey={refreshKey} />
          </>
        )}
      </main>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refresh}
        showToast={showToast}
      />
    </>
  )
}
