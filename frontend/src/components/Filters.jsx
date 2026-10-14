const S = {
  wrap: { background: '#fff', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: '1rem' },
  row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.75rem', fontWeight: 600, color: '#555' },
  clearBtn: { background: '#e2e8f0', color: '#333', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', alignSelf: 'flex-end' },
}

export default function Filters({ filters, onChange }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value || undefined })
  const clear = () => onChange({})

  return (
    <div style={S.wrap}>
      <div style={S.row}>
        <div style={S.field}>
          <label style={S.label}>Month</label>
          <input type="month" value={filters.month || ''} onChange={set('month')} />
        </div>
        <div style={S.field}>
          <label style={S.label}>From</label>
          <input type="date" value={filters.date_from || ''} onChange={set('date_from')} />
        </div>
        <div style={S.field}>
          <label style={S.label}>To</label>
          <input type="date" value={filters.date_to || ''} onChange={set('date_to')} />
        </div>
        <div style={S.field}>
          <label style={S.label}>Type</label>
          <select value={filters.type || ''} onChange={set('type')}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div style={S.field}>
          <label style={S.label}>Category</label>
          <input value={filters.category || ''} onChange={set('category')} placeholder="Any" style={{ width: 110 }} />
        </div>
        <div style={S.field}>
          <label style={S.label}>Search</label>
          <input value={filters.search || ''} onChange={set('search')} placeholder="e.g. Uber" style={{ width: 120 }} />
        </div>
        <div style={S.field}>
          <label style={S.label}>Sort by</label>
          <select value={filters.sort_by || 'timestamp'} onChange={set('sort_by')}>
            <option value="timestamp">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
        </div>
        <div style={S.field}>
          <label style={S.label}>Order</label>
          <select value={filters.sort_dir || 'desc'} onChange={set('sort_dir')}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <button style={S.clearBtn} onClick={clear}>Clear</button>
      </div>
    </div>
  )
}
