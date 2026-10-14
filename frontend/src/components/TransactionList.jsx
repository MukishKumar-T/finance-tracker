import { useState } from 'react'
import { deleteTransaction, reclassifyTransaction, exportCSV } from '../api/client'

const S = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0', color: '#555', fontWeight: 600, whiteSpace: 'nowrap' },
  td: { padding: '8px 10px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle' },
  income: { color: '#276749', fontWeight: 600 },
  expense: { color: '#c53030', fontWeight: 600 },
  balance: (v) => ({ fontWeight: 600, color: v >= 0 ? '#276749' : '#c53030' }),
  badge: (auto) => ({
    fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px',
    background: auto ? '#ebf8ff' : '#fefcbf',
    color: auto ? '#2b6cb0' : '#744210',
    fontWeight: 600,
  }),
  btn: (color) => ({ background: color, color: '#fff', padding: '4px 10px', borderRadius: '5px', fontSize: '0.78rem', marginLeft: 4, border: 'none', cursor: 'pointer' }),
  empty: { padding: '3rem', textAlign: 'center', color: '#aaa' },
  emptyTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#555' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  pagination: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', justifyContent: 'flex-end' },
  pageBtn: (disabled) => ({ background: disabled ? '#e2e8f0' : '#4f8ef7', color: disabled ? '#999' : '#fff', padding: '5px 12px', borderRadius: '5px', border: 'none', cursor: disabled ? 'default' : 'pointer' }),
}

export default function TransactionList({ data, loading, onRefresh, filters, onFiltersChange, showToast }) {
  const [editId, setEditId] = useState(null)
  const [editCat, setEditCat] = useState('')

  const transactions = data?.items || []
  const total = data?.total || 0
  const page = data?.page || 1
  const pages = data?.pages || 1
  const limit = data?.limit || 100

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(id)
      showToast('Transaction deleted.', 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error')
    }
  }

  const startEdit = (t) => { setEditId(t.id); setEditCat(t.category || '') }
  const cancelEdit = () => { setEditId(null); setEditCat('') }

  const saveEdit = async (id) => {
    try {
      await reclassifyTransaction(id, editCat)
      setEditId(null)
      showToast('Category updated.', 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message || 'Reclassify failed.', 'error')
    }
  }

  const handleExport = async () => {
    try {
      await exportCSV(filters)
      showToast('CSV downloaded.', 'success')
    } catch {
      showToast('Export failed.', 'error')
    }
  }

  const goToPage = (p) => {
    onFiltersChange({ ...filters, skip: (p - 1) * limit })
  }

  // Compute running balance (newest first → reverse for running total)
  const withBalance = [...transactions].reverse().reduce((acc, t, i) => {
    const prev = i === 0 ? 0 : acc[i - 1].running
    const delta = t.transaction_type === 'income' ? t.amount : -t.amount
    acc.push({ ...t, running: Math.round((prev + delta) * 100) / 100 })
    return acc
  }, []).reverse()

  if (loading) return <p style={S.empty}>Loading…</p>

  if (!transactions.length) return (
    <div style={S.empty}>
      <div style={S.emptyTitle}>No transactions found</div>
      <div style={{ fontSize: '0.85rem' }}>Add your first transaction using the form above, or clear the filters.</div>
    </div>
  )

  return (
    <div>
      <div style={S.toolbar}>
        <span style={{ fontSize: '0.85rem', color: '#555' }}>{total} transaction{total !== 1 ? 's' : ''}</span>
        <button style={{ ...S.btn('#38a169'), marginLeft: 0 }} onClick={handleExport}>⬇ Export CSV</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Description', 'Amount', 'Type', 'Category', 'Tagged', 'Date', 'Balance', 'Actions'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withBalance.map((t) => (
              <tr key={t.id}>
                <td style={S.td}>{t.description}</td>
                <td style={{ ...S.td, ...(t.transaction_type === 'income' ? S.income : S.expense) }}>
                  {t.transaction_type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                </td>
                <td style={S.td}>{t.transaction_type}</td>
                <td style={S.td}>
                  {editId === t.id ? (
                    <input value={editCat} onChange={(e) => setEditCat(e.target.value)} style={{ width: 120 }} />
                  ) : t.category}
                </td>
                <td style={S.td}>
                  <span style={S.badge(t.auto_tagged)}>{t.auto_tagged ? 'auto' : 'manual'}</span>
                </td>
                <td style={S.td}>{new Date(t.timestamp).toLocaleDateString()}</td>
                <td style={{ ...S.td, ...S.balance(t.running) }}>₹{t.running.toFixed(2)}</td>
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

      {pages > 1 && (
        <div style={S.pagination}>
          <button style={S.pageBtn(page === 1)} disabled={page === 1} onClick={() => goToPage(page - 1)}>← Prev</button>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Page {page} of {pages}</span>
          <button style={S.pageBtn(page === pages)} disabled={page === pages} onClick={() => goToPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}
