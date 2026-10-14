/**
 * MonthDropdown — Month + Year selects, emits a YYYY-MM string (or undefined).
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

const S = {
  wrap: { display: 'flex', gap: '4px', alignItems: 'center' },
  select: { padding: '6px 6px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem' },
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
    const updated = {
      month: field === 'month' ? e.target.value : month,
      year:  field === 'year'  ? e.target.value : year,
    }
    onChange(toYearMonth(updated.month, updated.year))
  }

  return (
    <div>
      {label && (
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>
          {label}
        </div>
      )}
      <div style={S.wrap}>
        <select style={S.select} value={month} onChange={handle('month')}>
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m.slice(0, 3)}</option>
          ))}
        </select>
        <select style={S.select} value={year} onChange={handle('year')}>
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
