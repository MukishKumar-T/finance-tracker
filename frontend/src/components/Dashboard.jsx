import { useState, useEffect } from 'react'
import { listTransactions, getSummary } from '../api/client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from 'recharts'

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  yellow:  '#f5c518',
  green:   '#4ade80',
  red:     '#f87171',
  blue:    '#60a5fa',
  surface: '#161616',
  surface2:'#1e1e1e',
  border:  '#2a2a2a',
  muted:   '#888',
  white:   '#f0f0f0',
}

// ─── Tiny helpers ────────────────────────────────────────────────────────────
const fmt  = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const card = (extra = {}) => ({
  background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: '1.25rem 1.5rem',
  boxShadow: '0 2px 12px rgba(0,0,0,.45)', ...extra,
})

// ─── Custom Tooltips ─────────────────────────────────────────────────────────
const DarkTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem' }}>
      <div style={{ color: C.muted, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color || C.yellow }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, sub, icon }) {
  return (
    <div style={{ ...card(), borderLeft: `3px solid ${accent}`, flex: '1 1 180px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          {label}
        </div>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.55rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: accent, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: C.white, marginBottom: '0.9rem' }}>
      {children}
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate, refreshKey }) {
  const [summary, setSummary]       = useState([])
  const [recent, setRecent]         = useState([])
  const [loading, setLoading]       = useState(true)

  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getSummary(),
      listTransactions({ limit: 5 }),
    ])
      .then(([sum, txData]) => {
        setSummary(sum)
        setRecent(txData?.items || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshKey])

  // ── Derived numbers ──────────────────────────────────────────────────────
  const currentMonthData = summary.find((s) => s.month === thisMonth)
  const allTimeIncome    = summary.reduce((a, s) => a + s.total_income, 0)
  const allTimeExpense   = summary.reduce((a, s) => a + s.total_expense, 0)
  const allTimeNet       = allTimeIncome - allTimeExpense

  const monthIncome  = currentMonthData?.total_income  ?? 0
  const monthExpense = currentMonthData?.total_expense ?? 0
  const monthNet     = monthIncome - monthExpense

  // ── Category bar data for current month ─────────────────────────────────
  const catData = (currentMonthData?.categories || [])
    .filter((c) => c.transaction_type === 'expense')
    .sort((a, b) => b.total - a.total)
    .slice(0, 7)
    .map((c) => ({ name: c.category, Amount: c.total }))

  // ── Last 6 months trend ──────────────────────────────────────────────────
  const trendData = summary.slice(-6).map((s) => ({
    month: s.month.slice(5),   // show MM only
    Income: s.total_income,
    Expense: s.total_expense,
  }))

  // ── Savings rate ─────────────────────────────────────────────────────────
  const savingsRate = monthIncome > 0
    ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100)
    : null

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320, color: C.muted }}>
      Loading dashboard…
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Stat Cards Row ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatCard
          label="All-time Balance"
          value={fmt(allTimeNet)}
          accent={allTimeNet >= 0 ? C.yellow : C.red}
          sub={`${fmt(allTimeIncome)} in · ${fmt(allTimeExpense)} out`}
        />
        <StatCard
          label="This Month Income"
          value={fmt(monthIncome)}
          accent={C.green}
          sub={thisMonth}
        />
        <StatCard
          label="This Month Expense"
          value={fmt(monthExpense)}
          accent={C.red}
          sub={thisMonth}
        />
        <StatCard
          label="This Month Net"
          value={fmt(monthNet)}
          accent={monthNet >= 0 ? C.blue : C.red}
          sub={savingsRate !== null ? `${savingsRate}% savings rate` : 'No income this month'}
        />
      </div>

      {/* ── Middle Row: Recent + Category Chart ────────────────────────── */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* Recent Transactions */}
        <div style={{ ...card(), flex: '1 1 340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
            <SectionTitle>Recent Transactions</SectionTitle>
            <button
              onClick={() => onNavigate('Transactions')}
              style={{ background: 'transparent', color: C.yellow, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>

          {recent.length === 0 && (
            <div style={{ textAlign: 'center', color: C.muted, padding: '2rem 0', fontSize: '0.9rem' }}>
              No transactions yet.{' '}
              <span
                style={{ color: C.yellow, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => onNavigate('Transactions')}
              >
                Add one →
              </span>
            </div>
          )}

          {recent.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.description}
                </div>
                <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>
                  {t.category} · {new Date(t.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginLeft: '1rem', color: t.transaction_type === 'income' ? C.green : C.red, whiteSpace: 'nowrap' }}>
                {t.transaction_type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Category Spend Chart */}
        <div style={{ ...card(), flex: '1 1 300px' }}>
          <SectionTitle>Top Expenses This Month</SectionTitle>
          {catData.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.muted, padding: '2rem 0', fontSize: '0.9rem' }}>No expense data this month.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<DarkTip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                <Bar dataKey="Amount" fill={C.yellow} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Monthly Trend ───────────────────────────────────── */}
      <div style={card()}>
        <SectionTitle>6-Month Trend</SectionTitle>
        {trendData.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: '2rem 0', fontSize: '0.9rem' }}>Not enough data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 12 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTip />} cursor={{ stroke: C.border }} />
              <Area type="monotone" dataKey="Income"  stroke={C.green} strokeWidth={2} fill="url(#gIncome)"  dot={{ fill: C.green,  r: 3 }} />
              <Area type="monotone" dataKey="Expense" stroke={C.red}   strokeWidth={2} fill="url(#gExpense)" dot={{ fill: C.red,    r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}
