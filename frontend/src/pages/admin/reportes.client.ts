import { cotizacionesAPI } from '../../services/api'
import { supabase } from '../../lib/supabase'

type Maybe<T> = T | null

type Vista = 'dia' | 'mes' | 'anio'

type Cot = {
  estado?: string
  evento?: { fecha?: string; salon?: string | null }
}

function qs<T extends HTMLElement>(sel: string): Maybe<T> {
  return document.querySelector(sel) as Maybe<T>
}

function extractYMD(value?: string): { y: number; m: number; d: number } | null {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() }
}

function statusKey(estado?: string): 'aceptada' | 'pendiente' | 'rechazada' | 'otra' {
  if (!estado) return 'otra'
  const e = estado.toLowerCase()
  if (e.includes('pendiente')) return 'pendiente'
  if (e.includes('aceptada')) return 'aceptada'
  if (e.includes('rechazada')) return 'rechazada'
  return 'otra'
}

async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    window.location.href = '/admin/login'
  }
}

function numberFmt(n: number): string {
  return new Intl.NumberFormat('es-CO').format(n)
}

function setText(el: Maybe<HTMLElement>, value: string) {
  if (el) el.textContent = value
}

function renderKpis(filtered: Cot[]) {
  const total = filtered.length
  const counts = { aceptada: 0, pendiente: 0, rechazada: 0, otra: 0 }
  filtered.forEach((c) => {
    const key = statusKey(c.estado)
    counts[key] += 1
  })
  setText(qs('#kpiTotal'), numberFmt(total))
  setText(qs('#kpiAprobadas'), numberFmt(counts.aceptada))
  setText(qs('#kpiPendientes'), numberFmt(counts.pendiente))
  setText(qs('#kpiRechazadas'), numberFmt(counts.rechazada))
}

function renderCalendar(
  container: Maybe<HTMLDivElement>,
  data: Array<{ label: string; count: number; isEmpty?: boolean }>,
  viewClass: string
) {
  if (!container) return
  container.innerHTML = ''
  container.className = `calendar-grid ${viewClass}`

  if (!data.length) {
    container.innerHTML = '<div class="placeholder">Sin datos para mostrar</div>'
    return
  }

  data.forEach((item) => {
    const cell = document.createElement('div')
    cell.className = item.isEmpty ? 'cal-cell empty' : item.count > 0 ? 'cal-cell has-data' : 'cal-cell'

    const label = document.createElement('div')
    label.className = 'cal-label'
    label.textContent = item.label

    cell.appendChild(label)

    if (!item.isEmpty && item.count > 0) {
      const count = document.createElement('div')
      count.className = 'cal-count'
      count.textContent = String(item.count)
      cell.appendChild(count)
    }

    container.appendChild(cell)
  })
}

function colorPalette(): string[] {
  return ['#0a4ba5', '#2563eb', '#f59e0b', '#10b981', '#ef4444', '#9333ea', '#14b8a6', '#f97316', '#64748b']
}

function renderDonut(target: Maybe<HTMLDivElement>, legendEl: Maybe<HTMLDivElement>, data: Record<string, number>) {
  if (!target || !legendEl) return
  const entries = Object.entries(data).filter(([, v]) => v > 0)
  const total = entries.reduce((acc, [, v]) => acc + v, 0)
  if (!entries.length || !total) {
    target.style.background = 'conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)'
    legendEl.innerHTML = '<div class="legend-item">Sin datos</div>'
    setText(qs('#donutTotal'), '0')
    return
  }

  const colors = colorPalette()
  let current = 0
  const segments: string[] = []
  const legendHTML: string[] = []

  entries.forEach(([salon, value], idx) => {
    const perc = (value / total) * 100
    const start = current
    const end = current + (perc / 100) * 360
    const color = colors[idx % colors.length]
    segments.push(`${color} ${start}deg ${end}deg`)
    current = end
    legendHTML.push(`
      <div class="legend-item">
        <div class="legend-left">
          <span class="dot" style="background:${color}"></span>
          <span>${salon}</span>
        </div>
        <span class="legend-perc">${perc.toFixed(1)}%</span>
      </div>
    `)
  })

  target.style.background = `conic-gradient(${segments.join(',')})`
  legendEl.innerHTML = legendHTML.join('')
  setText(qs('#donutTotal'), numberFmt(total))
}

async function main() {
  const vistaSelect = qs<HTMLSelectElement>('#vistaSelect')
  const monthSelect = qs<HTMLSelectElement>('#monthSelect')
  const yearSelect = qs<HTMLSelectElement>('#yearSelect')
  const monthWrap = qs<HTMLElement>('#monthSelectorWrap')
  const yearWrap = qs<HTMLElement>('#yearSelectorWrap')
  const chartTitle = qs<HTMLHeadingElement>('#chartTitle')
  const calendarGrid = qs<HTMLDivElement>('#calendarGrid')
  const donutChart = qs<HTMLDivElement>('#donutChart')
  const donutLegend = qs<HTMLDivElement>('#donutLegend')
  const btnRefrescar = qs<HTMLButtonElement>('#btnRefrescar')

  let cotizaciones: Cot[] = []
  let vista: Vista = 'dia'
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  let yearsDisponibles: number[] = []

  function updateSelectors() {
    if (!yearSelect || !monthSelect || !monthWrap || !yearWrap) return

    if (!yearsDisponibles.length) yearsDisponibles = [year]
    const opts = yearsDisponibles
      .slice()
      .sort((a, b) => b - a)
      .map((y) => `<option value="${y}">${y}</option>`)
    yearSelect.innerHTML = opts.join('')

    if (!yearsDisponibles.includes(year)) {
      year = yearsDisponibles[0]
    }
    yearSelect.value = String(year)
    monthSelect.value = String(month)

    if (vista === 'dia') {
      monthWrap.style.display = 'flex'
      yearWrap.style.display = 'flex'
    } else if (vista === 'mes') {
      monthWrap.style.display = 'none'
      yearWrap.style.display = 'flex'
    } else {
      monthWrap.style.display = 'none'
      yearWrap.style.display = 'none'
    }
  }

  function filteredData(): Cot[] {
    if (vista === 'dia') {
      return cotizaciones.filter((c) => {
        const parts = extractYMD(c.evento?.fecha)
        if (!parts) return false
        return parts.y === year && parts.m === month
      })
    } else if (vista === 'mes') {
      return cotizaciones.filter((c) => {
        const parts = extractYMD(c.evento?.fecha)
        if (!parts) return false
        return parts.y === year
      })
    }
    return cotizaciones
  }

  function buildCalendarData(): Array<{ label: string; count: number; isEmpty?: boolean }> {
    if (vista === 'dia') {
      const daysInMonth = new Date(year, month, 0).getDate()
      const firstDay = new Date(year, month - 1, 1).getDay()
      const offset = firstDay === 0 ? 6 : firstDay - 1

      const cells: Array<{ label: string; count: number; isEmpty?: boolean }> = []
      for (let i = 0; i < offset; i++) {
        cells.push({ label: '', count: 0, isEmpty: true })
      }

      const dayCounts: Record<number, number> = {}
      filteredData().forEach((c) => {
        const parts = extractYMD(c.evento?.fecha)
        if (!parts || parts.y !== year || parts.m !== month) return
        dayCounts[parts.d] = (dayCounts[parts.d] || 0) + 1
      })

      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ label: String(d), count: dayCounts[d] || 0 })
      }

      return cells
    } else if (vista === 'mes') {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const monthCounts: Record<number, number> = {}
      filteredData().forEach((c) => {
        const parts = extractYMD(c.evento?.fecha)
        if (!parts || parts.y !== year) return
        monthCounts[parts.m] = (monthCounts[parts.m] || 0) + 1
      })

      return monthNames.map((name, idx) => ({ label: name, count: monthCounts[idx + 1] || 0 }))
    } else {
      const yearCounts: Record<number, number> = {}
      cotizaciones.forEach((c) => {
        const parts = extractYMD(c.evento?.fecha)
        if (!parts) return
        yearCounts[parts.y] = (yearCounts[parts.y] || 0) + 1
      })

      return Object.keys(yearCounts)
        .map(Number)
        .sort((a, b) => a - b)
        .map((y) => ({ label: String(y), count: yearCounts[y] }))
    }
  }

  function buildSalonShare(): Record<string, number> {
    const acc: Record<string, number> = {}
    filteredData().forEach((c) => {
      const name = c.evento?.salon || 'Sin salón'
      acc[name] = (acc[name] || 0) + 1
    })
    return acc
  }

  function render() {
    const data = filteredData()
    renderKpis(data)

    const calData = buildCalendarData()
    const viewClass = `view-${vista}`
    renderCalendar(calendarGrid, calData, viewClass)

    const monthNames = ['Enero', 'Feb', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Sep', 'Oct', 'Nov', 'Dic']
    let titleText = ''
    if (vista === 'dia') {
      titleText = `Cotizaciones por día · ${monthNames[month - 1]} ${year}`
    } else if (vista === 'mes') {
      titleText = `Cotizaciones por mes · ${year}`
    } else {
      titleText = 'Cotizaciones por año'
    }
    if (chartTitle) chartTitle.textContent = titleText

    renderDonut(donutChart, donutLegend, buildSalonShare())
  }

  async function loadData() {
    if (calendarGrid) calendarGrid.innerHTML = '<div class="placeholder">Cargando...</div>'
    try {
      const resp = await cotizacionesAPI.listar({})
      cotizaciones = (resp as any)?.data || []
      yearsDisponibles = Array.from(
        new Set(
          cotizaciones
            .map((c) => extractYMD(c.evento?.fecha)?.y)
            .filter((v): v is number => typeof v === 'number')
        )
      )
      if (yearsDisponibles.length) {
        if (!yearsDisponibles.includes(year)) {
          year = Math.max(...yearsDisponibles)
        }
      }
      updateSelectors()
      render()
    } catch (err) {
      console.error('Error cargando reportes', err)
      if (calendarGrid) calendarGrid.innerHTML = '<div class="placeholder">No se pudieron cargar los datos.</div>'
    }
  }

  vistaSelect?.addEventListener('change', (e) => {
    vista = ((e.target as HTMLSelectElement).value as Vista) || 'dia'
    updateSelectors()
    render()
  })

  monthSelect?.addEventListener('change', (e) => {
    month = Number((e.target as HTMLSelectElement).value) || month
    render()
  })

  yearSelect?.addEventListener('change', (e) => {
    year = Number((e.target as HTMLSelectElement).value) || year
    render()
  })

  btnRefrescar?.addEventListener('click', () => {
    loadData()
  })

  await ensureSession()
  await loadData()
}

window.addEventListener('DOMContentLoaded', () => {
  main().catch((err) => console.error('Error inicializando reportes admin', err))
})


