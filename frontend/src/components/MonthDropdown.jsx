const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

const sel = {
  background: '#161616', border: '1px solid #2a2a2a',
  borderRadius: 6, padding: '7px 6px',
  fontSize: '0.8rem', color: '#f0f0f0',
  outline: 'none', cursor: 'pointer',
}

function pad(n) { return String(n).padStart(2, '0') }

function parse(value) {
  if (!value) return { month: '', year: '' }
  const [y, m] = value.split('-')
  return { month: String(parseInt(m, 10)), year: y }
}

function toYearMonth(month, year) {
  if (!month || !year) return undefined
  return `${year}-${pad(month)}`
}

export default function MonthDropdown({ value, onChange, label }) {
  const { month, year } = parse(value)

  const handle = (field) => (e) => {
    const u = { month, year, [field]: e.target.value }
    onChange(toYearMonth(u.month, u.year))
  }

  return (
    <div>
      {label && <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>}
      <div style={{ display: 'flex', gap: 4 }}>
        <select style={sel} value={month} onChange={handle('month')}>
          <option value="">Month</option>
          {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m.slice(0,3)}</option>)}
        </select>
        <select style={sel} value={year} onChange={handle('year')}>
          <option value="">Year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  )
}
