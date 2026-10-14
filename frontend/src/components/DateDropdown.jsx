/**
 * DateDropdown — Day / Month / Year selects.
 * Calls onChange(YYYY-MM-DD) only when all three are filled.
 * Shows current partial selections in the dropdowns always.
 * Calls onChange(undefined) when all are cleared.
 */

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)
const DAYS  = Array.from({ length: 31 }, (_, i) => i + 1)

const sel = {
  background: '#161616', border: '1px solid #2a2a2a',
  borderRadius: 6, padding: '7px 6px',
  fontSize: '0.8rem', color: '#f0f0f0',
  outline: 'none', cursor: 'pointer',
}

function pad(n) { return String(n).padStart(2, '0') }

function parse(iso) {
  if (!iso) return { day: '', month: '', year: '' }
  const [y, m, d] = iso.split('-')
  return { day: String(parseInt(d, 10)), month: String(parseInt(m, 10)), year: y }
}

import { useState, useEffect } from 'react'

export default function DateDropdown({ value, onChange, label }) {
  // Keep local partial state so user can fill fields in any order
  const parsed = parse(value)
  const [local, setLocal] = useState(parsed)

  // Sync if parent clears the value (e.g. "Clear filters" button)
  useEffect(() => {
    if (!value) setLocal({ day: '', month: '', year: '' })
  }, [value])

  const handle = (field) => (e) => {
    const updated = { ...local, [field]: e.target.value }
    setLocal(updated)

    const { day, month, year } = updated
    if (day && month && year) {
      // All three filled — emit ISO date
      onChange(`${year}-${pad(month)}-${pad(day)}`)
    } else if (!day && !month && !year) {
      // All cleared
      onChange(undefined)
    }
    // Partial — don't call onChange yet; keep waiting for the rest
  }

  return (
    <div>
      {label && (
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        <select style={sel} value={local.day} onChange={handle('day')}>
          <option value="">DD</option>
          {DAYS.map((d) => <option key={d} value={d}>{pad(d)}</option>)}
        </select>
        <select style={sel} value={local.month} onChange={handle('month')}>
          <option value="">MMM</option>
          {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m.slice(0,3)}</option>)}
        </select>
        <select style={sel} value={local.year} onChange={handle('year')}>
          <option value="">YYYY</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  )
}
