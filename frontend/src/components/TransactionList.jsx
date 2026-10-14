import { useState } from 'react'
import { deleteTransaction, reclassifyTransaction } from '../api/client'

const S = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0', color: '#555', fontWeight: 600 },
  td: { padding: '8px 10px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle' },
  income: { color: '#276749', fontWeight: 600 },
  expense: { color: '#c53030', fontWeight: 600 },
  badge: (auto) => ({
    fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px',
    background: auto ? '#ebf8ff' : '#fefcbf',
    color: auto ? '#2b6cb0' : '#744210',
    fontWeight: 600,
  }),
  btn: (color) => ({ background: color, color: '#fff', padding: '4px 10px', borderRadius: '5px', fontSize: '0.78rem', marginLeft: 4 }),
  empty: { padding: '2rem', textAlign: 'center', color: '#888' },
}

export default function TransactionList({ transactions, loading, onRefresh }) {
  const [editId, setEditId] = useState(null)
  const [editCat, setEditCat] = useState('')
  const [editError, setEditError] = useState('')

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(id)
      onRefresh()
    } catch (err) {
      alert(err.message || 'Delete failed.')
    }
  }

  const startEdit = (t) => { setEditId(t.id); setEditCat(t.category || ''); setEditError('') }
  const cancelEdit = () => { setEditId(null); setEditCat(''); setEditError('') }

  const saveEdit = async (id) => {
    setEditError('')
    try {
      await reclassifyTransaction(id, editCat)
      setEditId(null)
      onRefresh()
    } catch (err) {
      setEditError(err.message || 'Reclassify failed.')
    }
  }

  if (loading) return <p style={S.empty}>Loading…</p>
  if (!transactions.length) return <p style={S.empty}>No transactions found.</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={S.table}>
        <thead>
          <tr>
            {['Description', 'Amount', 'Type', 'Category', 'Tagged', 'Date', 'Actions'].map((h) => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td style={S.td}>{t.description}</td>
              <td style={{ ...S.td, ...(t.transaction_type === 'income' ? S.income : S.expense) }}>
                {t.transaction_type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
              </td>
              <td style={S.td}>{t.transaction_type}</td>
              <td style={S.td}>
                {editId === t.id ? (
                  <div>
                    <input value={editCat} onChange={(e) => setEditCat(e.target.value)} style={{ width: 120 }} />
                    {editError && <div style={{ color: 'red', fontSize: '0.75rem' }}>{editError}</div>}
                  </div>
                ) : t.category}
              </td>
              <td style={S.td}>
                <span style={S.badge(t.auto_tagged)}>{t.auto_tagged ? 'auto' : 'manual'}</span>
              </td>
              <td style={S.td}>{new Date(t.timestamp).toLocaleDateString()}</td>
              <td style={S.td}>
                {editId === t.id ? (
                  <>
                    <button style={S.btn('#38a169')} onClick={() => saveEdit(t.id)}>Save</button>
                    <button style={S.btn('#718096')} onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button style={S.btn('#4f8ef7')} onClick={() => startEdit(t)}>Edit</button>
                    <button style={S.btn('#e53e3e')} onClick={() => handleDelete(t.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
