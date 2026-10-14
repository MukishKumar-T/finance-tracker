import { useState } from 'react'
import { createTransaction } from '../api/client'

const S = {
  card: {
    background: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,.5)',
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#f0f0f0',
    marginBottom: '1.25rem',
  },
  row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 160px' },
  label: { fontSize: '0.72rem', fontWeight: 600, color: '#888', letterSpacing: '0.04em', textTransform: 'uppercase' },
  input: {
    background: '#1e1e1e',
    border: '1px solid #2a2a2a',
    borderRadius: 7,
    padding: '9px 12px',
    fontSize: '0.875rem',
    color: '#f0f0f0',
    outline: 'none',
    transition: 'border-color .15s',
  },
  btn: {
    background: '#f5c518',
    color: '#0d0d0d',
    padding: '10px 24px',
    borderRadius: 7,
    fontWeight: 700,
    fontSize: '0.9rem',
    border: 'none',
    whiteSpace: 'nowrap',
  },
}

export default function TransactionForm({ onCreated, showToast }) {
  const [form, setForm] = useState({ description: '', amount: '', transaction_type: 'expense', category: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return showToast('Description is required.', 'error')
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) return showToast('Amount must be a positive number.', 'error')

    const payload = {
      description: form.description.trim(),
      amount: amt,
      transaction_type: form.transaction_type,
    }
    if (form.category.trim()) payload.category = form.category.trim()

    setLoading(true)
    try {
      await createTransaction(payload)
      setForm({ description: '', amount: '', transaction_type: 'expense', category: '' })
      showToast('Transaction added.', 'success')
      onCreated?.()
    } catch (err) {
      showToast(err.message || 'Failed to create transaction.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.card}>
      <div style={S.title}>Add Transaction</div>
      <form onSubmit={handleSubmit}>
        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label}>Description</label>
            <input style={S.input} value={form.description} onChange={set('description')} placeholder="e.g. Uber to airport" maxLength={255} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Amount (₹)</label>
            <input style={S.input} type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" min="0.01" step="0.01" />
          </div>
          <div style={S.field}>
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
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Adding…' : '+ Add'}
          </button>
        </div>
      </form>
    </div>
  )
}
