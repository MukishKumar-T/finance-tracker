import { useState, useEffect } from 'react'
import { getSummary } from '../api/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export default function MonthlyBarChart({ refreshKey }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getSummary()
      .then((summary) => {
        if (!active) return
        const chartData = summary.map((m) => ({
          month: m.month,
          Income: m.total_income,
          Expense: m.total_expense,
          Net: m.net,
        }))
        setData(chartData)
      })
      .catch(() => setData([]))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Income vs Expense by Month</h2>
      {loading && <p>Loading…</p>}
      {!loading && data.length === 0 && <p style={{ color: '#888' }}>No data yet.</p>}
      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="Income" fill="#68d391" />
            <Bar dataKey="Expense" fill="#fc8181" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
