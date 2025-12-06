import { cotizacionesAPI } from '../../services/api'
import { supabase } from '../../lib/supabase'

type Maybe<T> = T | null

function qs<T extends HTMLElement>(sel: string): Maybe<T> {
  return document.querySelector(sel) as Maybe<T>
}

function extractYMD(value: string | Date): { y: number; m: number; d: number } | null {
  if (typeof value === 'string') {
    // Capture the date portion only, ignoring timezone offsets
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) {
      return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }
    }
  }

  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }
}

function dateKey(value: string | Date): string {
  const parts = extractYMD(value)
  if (!parts) return ''
  const { y, m, d } = parts
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function stateClass(estado?: string): string {
  if (!estado) return 'state-otro'
  const e = estado.toLowerCase()
  if (e.includes('pend')) return 'state-pendiente'
  if (e.includes('acept') || e.includes('aprob')) return 'state-aceptada'
  if (e.includes('rech')) return 'state-rechazada'
  return 'state-otro'
}

function formatFullDate(key: string): string {
  const parts = extractYMD(key)
  if (!parts) return key
  const date = new Date(parts.y, parts.m - 1, parts.d)
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    window.location.href = '/admin/login'
  }
}

async function main() {
  const authData = localStorage.getItem('adminAuth')
  if (!authData) {
    window.location.href = '/admin/login'
    return
  }

  const estadoSelect = qs<HTMLSelectElement>('#fEstado')
  const pagoSelect = qs<HTMLSelectElement>('#fPago')
  const btnFiltrar = qs<HTMLButtonElement>('#btnFiltrar')
  const btnRefrescar = qs<HTMLButtonElement>('#btnRefrescar')
  const monthLabel = qs<HTMLHeadingElement>('#monthLabel')
  const calendarDays = qs<HTMLDivElement>('#calendarDays')
  const prevMonthBtn = qs<HTMLButtonElement>('#prevMonth')
  const nextMonthBtn = qs<HTMLButtonElement>('#nextMonth')
  const dayTitle = qs<HTMLElement>('#dayTitle')
  const dayList = qs<HTMLDivElement>('#dayList')

  let cotizaciones: any[] = []
  let eventosPorFecha: Record<string, any[]> = {}
  let selectedDate: string | null = null
  let currentMonth = new Date()

  const badge = (txt: string) => `<span class="badge">${txt}</span>`

  const aplicaFiltros = (c: any) => {
    if (estadoSelect?.value && c.estado !== estadoSelect.value) return false
    if (pagoSelect?.value && c.estado_pago !== pagoSelect.value) return false
    return true
  }

  function firstAvailableDate(keys: string[]): string | null {
    if (!keys.length) return null
    return keys.sort()[0]
  }

  function rebuildEventos() {
    eventosPorFecha = {}
    cotizaciones.forEach((c) => {
      if (!aplicaFiltros(c)) return
      const key = dateKey(c.evento?.fecha)
      if (!key) return
      if (!eventosPorFecha[key]) eventosPorFecha[key] = []
      eventosPorFecha[key].push(c)
    })
  }

  function renderCalendar() {
    if (!calendarDays || !monthLabel) return
    calendarDays.innerHTML = ''

    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    monthLabel.textContent = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    const offset = (firstDay.getDay() + 6) % 7 // lunes = 0

    for (let i = 0; i < offset; i++) {
      const slot = document.createElement('div')
      slot.className = 'day empty'
      calendarDays.appendChild(slot)
    }

    const daysInMonth = lastDay.getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(y, m, day)
      const key = dateKey(cellDate)
      const eventos = eventosPorFecha[key] || []
      const chips = eventos.slice(0, 3).map((e) => ({
        salon: e.evento?.salon ?? 'Salón',
        estado: e.estado,
      }))

      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'day'
      el.dataset.date = key
      if (key === dateKey(new Date())) el.classList.add('is-today')
      if (key === selectedDate) el.classList.add('is-selected')

      el.innerHTML = `
        <div class="day__number">${day}</div>
        <div class="day__chips">
          ${chips
            .map(
              (c) => `
                <span class="chip ${stateClass(c.estado)}">
                  <span class="dot dot--event"></span>${c.salon}
                </span>
              `
            )
            .join('')}
          ${eventos.length > chips.length ? `<span class="chip more">+${eventos.length - chips.length}</span>` : ''}
        </div>
      `

      if (!eventos.length) el.classList.add('empty')
      calendarDays.appendChild(el)
    }

    calendarDays.onclick = (ev) => {
      const target = ev.target as HTMLElement
      const dayEl = target.closest('.day') as HTMLElement | null
      const key = dayEl?.dataset?.date
      if (!key || dayEl.classList.contains('empty')) return
      selectedDate = key
      renderCalendar()
      renderDayList()
    }
  }

  function renderDayList() {
    if (!dayList || !dayTitle) return
    if (!selectedDate) {
      dayTitle.textContent = 'Selecciona un día'
      dayList.innerHTML = '<div class="placeholder">Elige una fecha en el calendario.</div>'
      return
    }

    dayTitle.textContent = formatFullDate(selectedDate)
    const items = eventosPorFecha[selectedDate] || []
    if (!items.length) {
      dayList.innerHTML = '<div class="placeholder">Sin cotizaciones o reservas en esta fecha.</div>'
      return
    }

    dayList.innerHTML = items
      .map(
        (c) => `
        <div class="day-card">
          <div class="day-card__header">
            <div class="day-card__title">${c.cliente.nombre}</div>
            <div class="tag">${c.evento?.salon ?? 'Salón'}</div>
          </div>
          <div class="day-card__body">
            <div class="meta-row">
              <div class="meta"><strong>Email:</strong> ${c.cliente.email}</div>
              ${c.cliente.telefono ? `<div class="meta"><strong>Tel:</strong> ${c.cliente.telefono}</div>` : ''}
            </div>
            <div class="meta-row">
              <div class="meta"><strong>Hora:</strong> ${c.evento?.hora ?? ''}</div>
              <div class="meta"><strong>Asistentes:</strong> ${c.evento?.asistentes ?? ''} pax</div>
            </div>
            <div class="meta"><strong>#:</strong> ${c.numero}</div>
            <div class="meta-row">
              <span class="tag state ${c.estado ? c.estado.toLowerCase() : ''}">${c.estado}</span>
              <span class="tag pay">${c.estado_pago}</span>
            </div>
          </div>
          <div class="day-card__actions actions-cell">
            <button class="link" data-action="ver" data-id="${c.id}">Ver</button>
            <button class="link" data-action="abonado" data-id="${c.id}">Cerrar abonado</button>
            <button class="link" data-action="pagado" data-id="${c.id}">Cerrar pagado</button>
            <button class="link" data-action="pago" data-id="${c.id}">Registrar pago</button>
            <button class="link danger" data-action="rechazar" data-id="${c.id}">Rechazar</button>
            <button class="link" data-action="pdf" data-id="${c.id}">PDF</button>
            <button class="link" data-action="correo" data-id="${c.id}">Reenviar correo</button>
          </div>
        </div>
      `
      )
      .join('')
  }

  async function loadCotizaciones() {
    if (!calendarDays) return
    calendarDays.innerHTML = '<div class="placeholder">Cargando...</div>'
    try {
      const resp = await cotizacionesAPI.listar({})
      cotizaciones = resp.data || []
      rebuildEventos()
      const todayKey = dateKey(new Date())
      const availableKeys = Object.keys(eventosPorFecha)
      const firstKey = firstAvailableDate(availableKeys)
      if (eventosPorFecha[todayKey]?.length) {
        selectedDate = todayKey
      } else if (selectedDate && eventosPorFecha[selectedDate]?.length) {
        // keep current selection if still valid
      } else {
        selectedDate = firstKey
      }
      renderCalendar()
      renderDayList()
    } catch (err) {
      console.error(err)
      calendarDays.innerHTML = '<div class="error">No se pudieron cargar las cotizaciones.</div>'
    }
  }

  async function verCotizacion(id: number) {
    try {
      const resp = await cotizacionesAPI.obtener(id)
      const c = resp.data
      const detalles = (c as any).detalles || []
      const msg = `#${c.numero}\n${c.cliente.nombre} · ${c.cliente.email}\n${c.evento.fecha} ${c.evento.hora}\nTotal: $${c.totales.valor_total}\nEstado: ${c.estado} / ${c.estado_pago}\n\nDetalles:\n${detalles
        .map((d: any) => `- ${d.servicio}: ${d.cantidad} x ${d.valorUnitario} = ${d.total}`)
        .join('\n')}`
      alert(msg)
    } catch (err) {
      alert('No se pudo obtener el detalle')
    }
  }

  async function cerrarCotizacion(id: number, estadoPago: 'abonado' | 'pagado') {
    const monto = prompt(`Monto a registrar como ${estadoPago}. Deja vacío para usar el mínimo requerido.`)
    const payload: any = { estadoPago }
    if (monto) payload.montoPago = Number(monto)
    try {
      await cotizacionesAPI.cerrar(id, payload)
      await loadCotizaciones()
      alert('Cotización cerrada y calendario bloqueado.')
    } catch (err: any) {
      alert(err?.message || 'Error al cerrar la cotización')
    }
  }

  async function registrarPago(id: number) {
    const monto = prompt('Monto a registrar (COP):')
    if (!monto) return
    try {
      await cotizacionesAPI.registrarPago(id, { monto: Number(monto) })
      await loadCotizaciones()
      alert('Pago registrado')
    } catch (err: any) {
      alert(err?.message || 'Error registrando pago')
    }
  }

  async function rechazarCotizacion(id: number) {
    const motivo = prompt('Motivo de rechazo:') || undefined
    try {
      await cotizacionesAPI.rechazar(id, motivo)
      await loadCotizaciones()
      alert('Cotización rechazada')
    } catch (err: any) {
      alert(err?.message || 'Error al rechazar')
    }
  }

  function abrirPdf(id: number) {
    cotizacionesAPI.descargarPdf(id)
  }

  async function reenviarCorreo(id: number) {
    try {
      await cotizacionesAPI.reenviarCorreo(id)
      alert('Correo reenviado')
    } catch (err: any) {
      alert(err?.message || 'Error reenviando correo')
    }
  }

  dayList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target?.dataset) return
    const action = target.dataset.action
    const id = Number(target.dataset.id)
    if (!action || !id) return
    if (action === 'ver') verCotizacion(id)
    if (action === 'abonado') cerrarCotizacion(id, 'abonado')
    if (action === 'pagado') cerrarCotizacion(id, 'pagado')
    if (action === 'pago') registrarPago(id)
    if (action === 'rechazar') rechazarCotizacion(id)
    if (action === 'pdf') abrirPdf(id)
    if (action === 'correo') reenviarCorreo(id)
  })

  btnFiltrar?.addEventListener('click', () => {
    rebuildEventos()
    // Si la fecha seleccionada quedó sin eventos tras filtrar, tomamos la primera disponible
    if (!selectedDate || !eventosPorFecha[selectedDate]?.length) {
      selectedDate = firstAvailableDate(Object.keys(eventosPorFecha))
    }
    renderCalendar()
    renderDayList()
  })

  btnRefrescar?.addEventListener('click', () => {
    loadCotizaciones()
  })

  prevMonthBtn?.addEventListener('click', () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    renderCalendar()
  })

  nextMonthBtn?.addEventListener('click', () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    renderCalendar()
  })

  await ensureSession()
  await loadCotizaciones()
}

window.addEventListener('DOMContentLoaded', () => {
  main().catch((err) => console.error('Error inicializando reservas admin', err))
})
