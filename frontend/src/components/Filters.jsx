import DateDropdown from './DateDropdown'
import MonthDropdown from './MonthDropdown'

const S = {
  wrap: {
    background: '#1e1e1e',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    marginBottom: '1.25rem',
  },
  row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    background: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: 6,
    padding: '7px 10px',
    fontSize: '0.82rem',
    color: '#f0f0f0',
    outline: 'none',
  },
  clearBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #2a2a2a',
    padding: '7px 14px',
    borderRadius: 6,
    fontSize: '0.8rem',
    alignSelf: 'flex-end',
  },
}

export default function Filters({ filters, onChange }) {
  const set = (k) => (v) => onChange({ ...filters, [k]: v || undefined })
  const setEvent = (k) => (e) => onChange({ ...filters, [k]: e.target.value || undefined })
  const clear = () => onChange({})

  return (
    <div style={S.wrap}>
      <div style={S.row}>
        <MonthDropdown label="Month" value={filters.month} onChange={set('month')} />
        <DateDropdown label="From" value={filters.date_from} onChange={set('date_from')} />
        <DateDropdown label="To" value={filters.date_to} onChange={set('date_to')} />

        <div style={S.field}>
          <label style={S.label}>Type</label>
          <select value={filters.type || ''} onChange={setEvent('type')} style={S.input}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div style={S.field}>
          <label style={S.label}>Category</label>
          <input value={filters.category || ''} onChange={setEvent('category')} placeholder="Any" style={{ ...S.input, width: 110 }} />
        </div>

        <div style={S.field}>
          <label style={S.label}>Search</label>
          <input value={filters.search || ''} onChange={setEvent('search')} placeholder="e.g. Uber" style={{ ...S.input, width: 120 }} />
        </div>

        <div style={S.field}>
          <label style={S.label}>Sort by</label>
          <select value={filters.sort_by || 'timestamp'} onChange={setEvent('sort_by')} style={S.input}>
            <option value="timestamp">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div style={S.field}>
          <label style={S.label}>Order</label>
          <select value={filters.sort_dir || 'desc'} onChange={setEvent('sort_dir')} style={S.input}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        <button style={S.clearBtn} onClick={clear}>✕ Clear</button>
      </div>
    </div>
  )
}
