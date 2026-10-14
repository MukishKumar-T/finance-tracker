import { useState } from 'react'
import { deleteTransaction, reclassifyTransaction, exportCSV } from '../api/client'

const S = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    textAlign: 'left', padding: '10px 12px',
    borderBottom: '1px solid #2a2a2a',
    color: '#888', fontWeight: 600,
    fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  },
  td: { padding: '10px 12px', borderBottom: '1px solid #1e1e1e', verticalAlign: 'middle', color: '#e0e0e0' },
  trHover: { background: '#1a1a1a' },
  income: { color: '#4ade80', fontWeight: 600 },
  expense: { color: '#f87171', fontWeight: 600 },
  balance: (v) => ({ fontWeight: 600, color: v >= 0 ? '#4ade80' : '#f87171' }),
  badge: (auto) => ({
    fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20,
    background: auto ? 'rgba(79,142,247,.15)' : 'rgba(245,197,24,.15)',
    color: auto ? '#4f8ef7' : '#f5c518',
    fontWeight: 600, border: `1px solid ${auto ? 'rgba(79,142,247,.3)' : 'rgba(245,197,24,.3)'}`,
  }),
  btn: (color, bg) => ({
    background: bg || 'transparent',
    color: color,
    border: `1px solid ${color}`,
    padding: '4px 10px',
    borderRadius: 5,
    fontSize: '0.75rem',
    marginLeft: 4,
    fontWeight: 600,
    cursor: 'pointer',
  }),
  exportBtn: {
    background: '#f5c518',
    color: '#0d0d0d',
    border: 'none',
    padding: '6px 16px',
    borderRadius: 6,
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  meta: { fontSize: '0.8rem', color: '#555' },
  empty: { padding: '3rem', textAlign: 'center' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  emptyTitle: { fontSize: '1rem', fontWeight: 600, color: '#888', marginBottom: '0.4rem' },
  emptyHint: { fontSize: '0.82rem', color: '#555' },
  pagination: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', justifyContent: 'flex-end' },
  pageBtn: (disabled) => ({
    background: disabled ? 'transparent' : '#f5c518',
    color: disabled ? '#444' : '#0d0d0d',
    border: `1px solid ${disabled ? '#2a2a2a' : '#f5c518'}`,
    padding: '5px 14px', borderRadius: 5,
    cursor: disabled ? 'default' : 'pointer',
    fontWeight: 600, fontSize: '0.8rem',
  }),
  editInput: {
    background: '#0d0d0d', border: '1px solid #f5c518',
    borderRadius: 5, padding: '4px 8px',
    color: '#f0f0f0', fontSize: '0.82rem', width: 130,
  },
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

  const goToPage = (p) => onFiltersChange({ ...filters, skip: (p - 1) * limit })

  // Running balance (oldest → newest)
  const withBalance = [...transactions].reverse().reduce((acc, t, i) => {
    const prev = i === 0 ? 0 : acc[i - 1].running
    const delta = t.transaction_type === 'income' ? t.amount : -t.amount
    acc.push({ ...t, running: Math.round((prev + delta) * 100) / 100 })
    return acc
  }, []).reverse()

  if (loading) return (
    <div style={S.empty}>
      <div style={{ color: '#555', fontSize: '0.9rem' }}>Loading transactions…</div>
    </div>
  )

  if (!transactions.length) return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>📭</div>
      <div style={S.emptyTitle}>No transactions found</div>
      <div style={S.emptyHint}>Add your first transaction above, or clear the filters.</div>
    </div>
  )

  return (
    <div>
      <div style={S.toolbar}>
        <span style={S.meta}>{total} transaction{total !== 1 ? 's' : ''}</span>
        <button style={S.exportBtn} onClick={handleExport}>⬇ Export CSV</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Description', 'Amount', 'Type', 'Category', 'Tag', 'Date', 'Balance', 'Actions'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withBalance.map((t) => (
              <tr key={t.id} style={S.trHover}>
                <td style={S.td}>{t.description}</td>
                <td style={{ ...S.td, ...(t.transaction_type === 'income' ? S.income : S.expense) }}>
                  {t.transaction_type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                </td>
                <td style={{ ...S.td, color: '#888', fontSize: '0.8rem' }}>{t.transaction_type}</td>
                <td style={S.td}>
                  {editId === t.id
                    ? <input style={S.editInput} value={editCat} onChange={(e) => setEditCat(e.target.value)} />
                    : t.category}
                </td>
                <td style={S.td}>
                  <span style={S.badge(t.auto_tagged)}>{t.auto_tagged ? 'auto' : 'manual'}</span>
                </td>
                <td style={{ ...S.td, color: '#888', fontSize: '0.8rem' }}>{new Date(t.timestamp).toLocaleDateString()}</td>
                <td style={{ ...S.td, ...S.balance(t.running) }}>₹{t.running.toFixed(2)}</td>
                <td style={S.td}>
                  {editId === t.id ? (
                    <>
                      <button style={S.btn('#4ade80')} onClick={() => saveEdit(t.id)}>Save</button>
                      <button style={S.btn('#888')} onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button style={S.btn('#f5c518')} onClick={() => startEdit(t)}>Edit</button>
                      <button style={S.btn('#f87171')} onClick={() => handleDelete(t.id)}>Delete</button>
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
          <span style={{ fontSize: '0.82rem', color: '#555' }}>Page {page} of {pages}</span>
          <button style={S.pageBtn(page === pages)} disabled={page === pages} onClick={() => goToPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}
