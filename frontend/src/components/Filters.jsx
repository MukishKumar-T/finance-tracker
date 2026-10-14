const S = {
  bar: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' },
  label: { fontSize: '0.75rem', fontWeight: 600, color: '#555' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
}

export default function Filters({ filters, onChange }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value || undefined })

  return (
    <div style={S.bar}>
      <div style={S.field}>
        <label style={S.label}>Month</label>
        <input type="month" value={filters.month || ''} onChange={set('month')} />
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
        <input value={filters.category || ''} onChange={set('category')} placeholder="Any" />
      </div>
    </div>
  )
}
