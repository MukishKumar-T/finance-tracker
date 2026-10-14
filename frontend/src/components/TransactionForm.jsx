import { useState } from 'react'
import { createTransaction } from '../api/client'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)
const DAYS  = Array.from({ length: 31 }, (_, i) => i + 1)
function pad(n) { return String(n).padStart(2, '0') }

const S = {
  card: {
    background: '#161616', border: '1px solid #2a2a2a',
    borderRadius: 12, padding: '1.5rem',
    marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.5)',
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.05rem', fontWeight: 700,
    color: '#f0f0f0', marginBottom: '1.25rem',
  },
  row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 150px' },
  fieldNarrow: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.72rem', fontWeight: 600, color: '#888', letterSpacing: '0.04em', textTransform: 'uppercase' },
  input: {
    background: '#1e1e1e', border: '1px solid #2a2a2a',
    borderRadius: 7, padding: '9px 12px',
    fontSize: '0.875rem', color: '#f0f0f0', outline: 'none',
    transition: 'border-color .15s',
    fontFamily: "'Inter', sans-serif",
  },
  sel: {
    background: '#1e1e1e', border: '1px solid #2a2a2a',
    borderRadius: 6, padding: '8px 7px',
    fontSize: '0.82rem', color: '#f0f0f0', outline: 'none', cursor: 'pointer',
  },
  divider: { width: '100%', height: 1, background: '#2a2a2a', margin: '0.75rem 0' },
  dateRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  dateLabel: { fontSize: '0.72rem', fontWeight: 600, color: '#888', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 },
  checkRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', marginBottom: '0.5rem' },
  checkLabel: { fontSize: '0.85rem', color: '#888', cursor: 'pointer' },
  btn: {
    background: '#f5c518', color: '#0d0d0d',
    padding: '10px 24px', borderRadius: 7,
    fontWeight: 700, fontSize: '0.9rem', border: 'none',
    whiteSpace: 'nowrap', alignSelf: 'flex-end',
  },
}

const EMPTY = { description: '', amount: '', transaction_type: 'expense', category: '' }
const NOW   = new Date()

export default function TransactionForm({ onCreated, showToast }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [backdate, setBackdate] = useState(false)

  // Separate date parts so user can fill in any order
  const [dateDay,   setDateDay]   = useState('')
  const [dateMon,   setDateMon]   = useState('')
  const [dateYear,  setDateYear]  = useState('')
  const [dateHour,  setDateHour]  = useState('12')
  const [dateMin,   setDateMin]   = useState('00')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const buildTimestamp = () => {
    if (!backdate) return undefined
    if (!dateDay || !dateMon || !dateYear) return undefined
    return `${dateYear}-${pad(dateMon)}-${pad(dateDay)}T${pad(dateHour)}:${pad(dateMin)}:00`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return showToast('Description is required.', 'error')
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) return showToast('Amount must be a positive number.', 'error')

    if (backdate && (!dateDay || !dateMon || !dateYear)) {
      return showToast('Please fill in all date fields for backdating.', 'error')
    }

    const payload = {
      description: form.description.trim(),
      amount: amt,
      transaction_type: form.transaction_type,
    }
    if (form.category.trim()) payload.category = form.category.trim()
    const ts = buildTimestamp()
    if (ts) payload.timestamp = ts

    setLoading(true)
    try {
      await createTransaction(payload)
      setForm(EMPTY)
      setBackdate(false)
      setDateDay(''); setDateMon(''); setDateYear(''); setDateHour('12'); setDateMin('00')
      showToast('Transaction added.', 'success')
      onCreated?.()
    } catch (err) {
      showToast(err.message || 'Failed to create transaction.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const hours   = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div style={S.card}>
      <div style={S.title}>Add Transaction</div>
      <form onSubmit={handleSubmit}>
        {/* Main fields */}
        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label}>Description</label>
            <input style={S.input} value={form.description} onChange={set('description')} placeholder="e.g. Uber to airport" maxLength={255} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Amount (₹)</label>
            <input style={S.input} type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" min="0.01" step="0.01" />
          </div>
          <div style={{ ...S.field, flex: '0 1 130px' }}>
            <label style={S.label}>Type</label>
            <select style={S.input} value={form.transaction_type} onChange={set('transaction_type')}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Category override</label>
            <input style={S.input} value={form.category} onChange={set('category')} placeholder="Optional" maxLength={50} />
          </div>
        </div>

        {/* Backdate toggle */}
        <div style={S.checkRow}>
          <input
            type="checkbox" id="backdate" checked={backdate}
            onChange={(e) => setBackdate(e.target.checked)}
            style={{ accentColor: '#f5c518', width: 15, height: 15, cursor: 'pointer' }}
          />
          <label htmlFor="backdate" style={S.checkLabel}>Add as a past transaction (backdate)</label>
        </div>

        {/* Backdate fields */}
        {backdate && (
          <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '1rem', marginTop: '0.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f5c518', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Transaction Date &amp; Time
            </div>
            <div style={S.dateRow}>
              {/* Day */}
              <div style={S.fieldNarrow}>
                <div style={S.dateLabel}>Day</div>
                <select style={S.sel} value={dateDay} onChange={(e) => setDateDay(e.target.value)}>
                  <option value="">DD</option>
                  {DAYS.map((d) => <option key={d} value={d}>{pad(d)}</option>)}
                </select>
              </div>
              {/* Month */}
              <div style={S.fieldNarrow}>
                <div style={S.dateLabel}>Month</div>
                <select style={S.sel} value={dateMon} onChange={(e) => setDateMon(e.target.value)}>
                  <option value="">MMM</option>
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m.slice(0,3)}</option>)}
                </select>
              </div>
              {/* Year */}
              <div style={S.fieldNarrow}>
                <div style={S.dateLabel}>Year</div>
                <select style={S.sel} value={dateYear} onChange={(e) => setDateYear(e.target.value)}>
                  <option value="">YYYY</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {/* Hour */}
              <div style={S.fieldNarrow}>
                <div style={S.dateLabel}>Hour</div>
                <select style={S.sel} value={dateHour} onChange={(e) => setDateHour(e.target.value)}>
                  {hours.map((h) => <option key={h} value={h}>{pad(h)}</option>)}
                </select>
              </div>
              {/* Minute */}
              <div style={S.fieldNarrow}>
                <div style={S.dateLabel}>Min</div>
                <select style={S.sel} value={dateMin} onChange={(e) => setDateMin(e.target.value)}>
                  {minutes.map((m) => <option key={m} value={m}>{pad(m)}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Adding…' : '+ Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}
