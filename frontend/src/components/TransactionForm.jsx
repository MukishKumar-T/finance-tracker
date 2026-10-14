import { useState } from 'react'
import { createTransaction } from '../api/client'

const STYLES = {
  form: { background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: '1.5rem' },
  row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 160px' },
  label: { fontSize: '0.75rem', fontWeight: 600, color: '#555' },
  error: { color: '#e53e3e', fontSize: '0.8rem', marginTop: '0.5rem' },
  btn: { background: '#4f8ef7', color: '#fff', padding: '8px 18px', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem' },
}

export default function TransactionForm({ onCreated }) {
  const [form, setForm] = useState({ description: '', amount: '', transaction_type: 'expense', category: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation mirrors backend
    if (!form.description.trim()) return setError('Description is required.')
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) return setError('Amount must be a positive number.')

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
      onCreated?.()
    } catch (err) {
      setError(err.message || 'Failed to create transaction.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={STYLES.form}>
      <h2 style={{ marginBottom: '1rem' }}>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Description</label>
            <input value={form.description} onChange={set('description')} placeholder="e.g. Uber to airport" maxLength={255} />
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Amount</label>
            <input type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" min="0.01" step="0.01" />
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Type</label>
            <select value={form.transaction_type} onChange={set('transaction_type')}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Category (optional override)</label>
            <input value={form.category} onChange={set('category')} placeholder="e.g. Travel" maxLength={50} />
          </div>
          <button type="submit" style={STYLES.btn} disabled={loading}>
            {loading ? 'Adding…' : 'Add'}
          </button>
        </div>
        {error && <p style={STYLES.error}>{error}</p>}
      </form>
    </div>
  )
}
