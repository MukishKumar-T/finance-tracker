import DateDropdown from './DateDropdown'
import MonthDropdown from './MonthDropdown'

const S = {
  wrap: { background: '#fff', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: '1rem' },
  row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.75rem', fontWeight: 600, color: '#555' },
  clearBtn: { background: '#e2e8f0', color: '#333', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' },
  select: { padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.875rem' },
  input: { padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.875rem' },
}

export default function Filters({ filters, onChange }) {
  const set = (k) => (v) => onChange({ ...filters, [k]: v || undefined })
  const setEvent = (k) => (e) => onChange({ ...filters, [k]: e.target.value || undefined })
  const clear = () => onChange({})

  return (
    <div style={S.wrap}>
      <div style={S.row}>

        {/* Month filter */}
        <MonthDropdown
          label="Month"
          value={filters.month}
          onChange={set('month')}
        />

        {/* Date from — dropdown */}
        <DateDropdown
          label="From"
          value={filters.date_from}
          onChange={set('date_from')}
        />

        {/* Date to — dropdown */}
        <DateDropdown
          label="To"
          value={filters.date_to}
          onChange={set('date_to')}
        />

        {/* Type */}
        <div style={S.field}>
          <label style={S.label}>Type</label>
          <select value={filters.type || ''} onChange={setEvent('type')} style={S.select}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category */}
        <div style={S.field}>
          <label style={S.label}>Category</label>
          <input
            value={filters.category || ''}
            onChange={setEvent('category')}
            placeholder="Any"
            style={{ ...S.input, width: 110 }}
          />
        </div>

        {/* Search */}
        <div style={S.field}>
          <label style={S.label}>Search</label>
          <input
            value={filters.search || ''}
            onChange={setEvent('search')}
            placeholder="e.g. Uber"
            style={{ ...S.input, width: 120 }}
          />
        </div>

        {/* Sort by */}
        <div style={S.field}>
          <label style={S.label}>Sort by</label>
          <select value={filters.sort_by || 'timestamp'} onChange={setEvent('sort_by')} style={S.select}>
            <option value="timestamp">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
        </div>

        {/* Sort direction */}
        <div style={S.field}>
          <label style={S.label}>Order</label>
          <select value={filters.sort_dir || 'desc'} onChange={setEvent('sort_dir')} style={S.select}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        <button style={S.clearBtn} onClick={clear}>Clear</button>
      </div>
    </div>
  )
}
