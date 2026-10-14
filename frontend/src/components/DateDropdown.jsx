/**
 * DateDropdown — renders three selects (Day / Month / Year) and emits a
 * YYYY-MM-DD string (or undefined when cleared) via onChange.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

const S = {
  wrap: { display: 'flex', gap: '4px', alignItems: 'center' },
  select: { padding: '6px 6px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem' },
}

function pad(n) { return String(n).padStart(2, '0') }

function parseDate(iso) {
  if (!iso) return { day: '', month: '', year: '' }
  const [y, m, d] = iso.split('-')
  return { day: String(parseInt(d, 10)), month: String(parseInt(m, 10)), year: y }
}

function toISO(day, month, year) {
  if (!day || !month || !year) return undefined
  return `${year}-${pad(month)}-${pad(day)}`
}

export default function DateDropdown({ value, onChange, label }) {
  const { day, month, year } = parseDate(value)

  const handle = (field) => (e) => {
    const updated = {
      day: field === 'day' ? e.target.value : day,
      month: field === 'month' ? e.target.value : month,
      year: field === 'year' ? e.target.value : year,
    }
    onChange(toISO(updated.day, updated.month, updated.year))
  }

  return (
    <div>
      {label && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</div>}
      <div style={S.wrap}>
        <select style={S.select} value={day} onChange={handle('day')}>
          <option value="">DD</option>
          {DAYS.map((d) => <option key={d} value={d}>{pad(d)}</option>)}
        </select>
        <select style={S.select} value={month} onChange={handle('month')}>
          <option value="">MM</option>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m.slice(0, 3)}</option>)}
        </select>
        <select style={S.select} value={year} onChange={handle('year')}>
          <option value="">YYYY</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  )
}
