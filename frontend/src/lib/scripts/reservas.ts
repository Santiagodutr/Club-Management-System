import { cotizacionesAPI, espaciosPublicosAPI } from '../../services/api'
import { supabase } from '../../lib/supabase'

type Maybe<T> = T | null

function qs<T extends HTMLElement>(sel: string): Maybe<T> {
  return document.querySelector(sel) as Maybe<T>
}

// Sistema de modales elegantes
class Modal {
  private overlay: HTMLDivElement
  private modal: HTMLDivElement

  constructor() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'modal-overlay'
    this.modal = document.createElement('div')
    this.modal.className = 'modal'
    this.overlay.appendChild(this.modal)
  }

  show(content: string, actions: { label: string; handler: () => void; variant?: 'primary' | 'danger' | 'secondary' }[] = []) {
    this.modal.innerHTML = `
      <div class="modal__content">${content}</div>
      <div class="modal__actions">
        ${actions.map(a => `<button class="btn ${a.variant || 'secondary'}" data-action="${a.label}">${a.label}</button>`).join('')}
      </div>
    `

    actions.forEach(action => {
      const btn = this.modal.querySelector(`[data-action="${action.label}"]`)
      btn?.addEventListener('click', () => {
        action.handler()
        this.close()
      })
    })

    document.body.appendChild(this.overlay)
    setTimeout(() => this.overlay.classList.add('show'), 10)
  }

  prompt(title: string, placeholder: string, callback: (value: string | null) => void) {
    this.modal.innerHTML = `
      <div class="modal__content">
        <h3>${title}</h3>
        <input type="text" class="modal__input" placeholder="${placeholder}" />
      </div>
      <div class="modal__actions">
        <button class="btn secondary" data-action="cancel">Cancelar</button>
        <button class="btn primary" data-action="confirm">Confirmar</button>
      </div>
    `

    const input = this.modal.querySelector('.modal__input') as HTMLInputElement
    const cancelBtn = this.modal.querySelector('[data-action="cancel"]')
    const confirmBtn = this.modal.querySelector('[data-action="confirm"]')

    cancelBtn?.addEventListener('click', () => {
      callback(null)
      this.close()
    })

    confirmBtn?.addEventListener('click', () => {
      callback(input.value)
      this.close()
    })

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        callback(input.value)
        this.close()
      }
    })

    document.body.appendChild(this.overlay)
    setTimeout(() => {
      this.overlay.classList.add('show')
      input.focus()
    }, 10)
  }

  alert(message: string, variant: 'success' | 'error' | 'info' = 'info') {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    }
    
    this.modal.innerHTML = `
      <div class="modal__content modal__content--${variant}">
        <div class="modal__icon">${icons[variant]}</div>
        <p>${message}</p>
      </div>
      <div class="modal__actions">
        <button class="btn primary" data-action="ok">OK</button>
      </div>
    `

    const okBtn = this.modal.querySelector('[data-action="ok"]')
    okBtn?.addEventListener('click', () => this.close())

    document.body.appendChild(this.overlay)
    setTimeout(() => this.overlay.classList.add('show'), 10)
  }

  close() {
    this.overlay.classList.remove('show')
    setTimeout(() => {
      if (this.overlay.parentNode) {
        document.body.removeChild(this.overlay)
      }
    }, 300)
  }
}

// Loading overlay global
class LoadingOverlay {
  private overlay: HTMLDivElement

  constructor() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'loading-overlay'
    this.overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">Procesando...</p>
      </div>
    `
  }

  show(message: string = 'Procesando...') {
    const text = this.overlay.querySelector('.loading-text')
    if (text) text.textContent = message
    document.body.appendChild(this.overlay)
    setTimeout(() => this.overlay.classList.add('show'), 10)
  }

  hide() {
    this.overlay.classList.remove('show')
    setTimeout(() => {
      if (this.overlay.parentNode) {
        document.body.removeChild(this.overlay)
      }
    }, 300)
  }
}

function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
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
  // Usar getFreshToken para auto-refresh
  const { getFreshToken } = await import('../auth')
  const token = await getFreshToken()
  if (!token) {
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
  const salonSelect = qs<HTMLSelectElement>('#fSalon')
  const buscarIdInput = qs<HTMLInputElement>('#fBuscarId')
  const ordenSelect = qs<HTMLSelectElement>('#fOrden')
  const monthLabel = qs<HTMLHeadingElement>('#monthLabel')
  const calendarDays = qs<HTMLDivElement>('#calendarDays')
  const prevMonthBtn = qs<HTMLButtonElement>('#prevMonth')
  const nextMonthBtn = qs<HTMLButtonElement>('#nextMonth')
  const dayTitle = qs<HTMLElement>('#dayTitle')
  const dayList = qs<HTMLDivElement>('#dayList')
  const listaContainer = qs<HTMLDivElement>('#listaContainer')
  const btnVistaCalendario = qs<HTMLButtonElement>('#btnVistaCalendario')
  const btnVistaLista = qs<HTMLButtonElement>('#btnVistaLista')
  const vistaCalendario = qs<HTMLDivElement>('#vistaCalendario')
  const vistaLista = qs<HTMLDivElement>('#vistaLista')
  const detalleDelDia = qs<HTMLElement>('#detalleDelDia')
  const eyebrowVista = qs<HTMLElement>('#eyebrowVista')

  let cotizaciones: any[] = []
  let allCotizaciones: any[] = [] // Mantener todas las cotizaciones sin filtrar
  let eventosPorFecha: Record<string, any[]> = {}
  let selectedDate: string | null = null
  let currentMonth = new Date()
  let vistaActual: 'calendario' | 'lista' = 'calendario'

  const badge = (txt: string) => `<span class="badge">${txt}</span>`

  function firstAvailableDate(keys: string[]): string | null {
    if (!keys.length) return null
    return keys.sort()[0]
  }

  function rebuildEventos() {
    eventosPorFecha = {}
    // Usar allCotizaciones para reconstruir los eventos
    cotizaciones = allCotizaciones.filter((c) => {
      // Filtro por búsqueda de ID
      if (buscarIdInput?.value.trim()) {
        const busqueda = buscarIdInput.value.trim().toLowerCase()
        const idStr = c.id?.toString().toLowerCase() || ''
        if (!idStr.includes(busqueda)) return false
      }
      
      // Filtro por estado
      if (estadoSelect?.value) {
        const estadoFiltro = estadoSelect.value.toLowerCase()
        const estadoCotizacion = (c.estado || '').toLowerCase()
        
        // Normalizar "pendiente de aprobación" a "pendiente"
        const estadoNormalizado = estadoCotizacion.includes('pendiente') ? 'pendiente' : estadoCotizacion
        
        if (estadoNormalizado !== estadoFiltro) return false
      }
      
      // Filtro por estado de pago
      if (pagoSelect?.value) {
        const pagoFiltro = pagoSelect.value.toLowerCase()
        const pagoCotizacion = (c.estado_pago || '').toLowerCase()
        if (pagoCotizacion !== pagoFiltro) return false
      }
      
      // Filtro por salón
      if (salonSelect?.value) {
        const salonFiltro = parseInt(salonSelect.value)
        const salonCotizacion = c.evento?.espacio_id
        if (salonCotizacion !== salonFiltro) return false
      }
      
      return true
    })

    cotizaciones.forEach((c) => {
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

  function renderListaView() {
    if (!listaContainer) return
    
    if (cotizaciones.length === 0) {
      listaContainer.innerHTML = '<div class="placeholder">No hay cotizaciones para mostrar con los filtros aplicados.</div>'
      return
    }

    // Agrupar por fecha y ordenar según el criterio seleccionado
    const orden = ordenSelect?.value || 'reciente'
    const fechasOrdenadas = Object.keys(eventosPorFecha).sort((a, b) => {
      if (orden === 'reciente') {
        return b.localeCompare(a) // Más reciente primero (descendente)
      } else {
        return a.localeCompare(b) // Más antigua primero (ascendente)
      }
    })
    
    if (fechasOrdenadas.length === 0) {
      listaContainer.innerHTML = '<div class="placeholder">No hay cotizaciones para mostrar con los filtros aplicados.</div>'
      return
    }

    const html = fechasOrdenadas.map(fecha => {
      const items = eventosPorFecha[fecha] || []
      const fechaFormateada = formatFullDate(fecha)
      
      const cotizacionesHTML = items.map(c => {
        const valorTotal = typeof c.totales?.valor_total === 'string' 
          ? parseFloat(c.totales.valor_total) 
          : (c.totales?.valor_total || 0)
        const totalPagado = typeof c.totales?.total_pagado === 'string'
          ? parseFloat(c.totales.total_pagado)
          : (c.totales?.total_pagado || 0)
        const abonoRequerido = typeof c.totales?.abono_requerido === 'string'
          ? parseFloat(c.totales.abono_requerido)
          : (c.totales?.abono_requerido || 0)
        const saldoPendiente = valorTotal - totalPagado

        const estadoClase = c.estado ? `estado-${c.estado.toLowerCase()}` : ''
        
        // Calculate end time
        const horaInicio = c.evento?.hora ?? '00:00'
        const duracion = c.evento?.duracion || 0
        const calcularHoraFin = (inicio: string, horas: number): string => {
          const [h, m] = inicio.split(':').map(Number)
          const totalMinutos = h * 60 + m + (horas * 60)
          const horaFin = Math.floor(totalMinutos / 60) % 24
          const minutosFin = totalMinutos % 60
          return `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`
        }
        const horaFin = calcularHoraFin(horaInicio, duracion)
        
        // Check if it's a socio quotation
        const esSocio = c.tipoCliente === 'socio'
        const estadoClass = esSocio ? `day-card--socio-${c.estado?.toLowerCase() || 'pendiente'}` : ''
        
        return `
        <div class="day-card ${estadoClass}">
          <div class="card-menu">
            <button class="card-menu__btn" data-id="${c.id}" title="Más opciones">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <div class="card-menu__dropdown" data-menu="${c.id}">
              <button class="card-menu__item" data-action="eliminar" data-id="${c.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
          <div class="day-card__header ${estadoClase}">
            <div class="day-card__title-section">
              <h3 class="day-card__title">
                ${c.cliente.nombre}
                <span style="font-weight: 400; font-size: 0.85rem; color: #64748b;">#${c.id}</span>
                ${esSocio ? '<span style="font-weight: 500; font-size: 0.8rem; color: #64748b;"> · Socio del Club</span>' : ''}
              </h3>
              <p class="day-card__subtitle">${c.cliente.email}</p>
            </div>
            <div class="day-card__salon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${c.evento?.salon ?? 'Salón'}
            </div>
          </div>
          
          <div class="day-card__body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Hora de Inicio</span>
                <span class="info-value">${horaInicio}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hora de Fin</span>
                <span class="info-value">${horaFin}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Duración</span>
                <span class="info-value">${duracion} horas</span>
              </div>
              <div class="info-item">
                <span class="info-label">Asistentes</span>
                <span class="info-value">${c.evento?.asistentes ?? 0} personas</span>
              </div>
              ${c.evento?.tipo ? `
              <div class="info-item">
                <span class="info-label">Tipo de Evento</span>
                <span class="info-value">${c.evento.tipo}</span>
              </div>
              ` : ''}
              ${c.cliente.telefono ? `
              <div class="info-item">
                <span class="info-label">Teléfono</span>
                <span class="info-value">${c.cliente.telefono}</span>
              </div>
              ` : ''}
            </div>
            
            ${c.estado && c.estado.toLowerCase() !== 'rechazada' ? `
            <div class="info-grid info-grid--financial">
              <div class="info-item">
                <span class="info-label">Valor Total</span>
                <span class="info-value highlight">${formatCurrency(valorTotal)}</span>
              </div>
              ${totalPagado > 0 ? `
              <div class="info-item">
                <span class="info-label">Total Pagado</span>
                <span class="info-value success">${formatCurrency(totalPagado)}</span>
              </div>
              ` : `
              <div class="info-item">
                <span class="info-label">Abono Requerido (50%)</span>
                <span class="info-value">${formatCurrency(abonoRequerido)}</span>
              </div>
              `}
              ${saldoPendiente > 0 ? `
              <div class="info-item">
                <span class="info-label">Saldo Pendiente</span>
                <span class="info-value warning">${formatCurrency(saldoPendiente)}</span>
              </div>
              ` : ''}
            </div>
            ` : `
            <div class="info-grid info-grid--financial">
              <div class="info-item">
                <span class="info-label">Valor Total</span>
                <span class="info-value highlight">${formatCurrency(valorTotal)}</span>
              </div>
            </div>
            `}
            
            <div class="status-row">
              <span class="badge badge-estado ${c.estado ? c.estado.toLowerCase() : ''}">${(c as any).estado_legible || c.estado || 'Sin estado'}</span>
              ${c.estado && c.estado.toLowerCase() !== 'rechazada' ? `
              <span class="badge badge-pago ${(c as any).estado_pago === 'pagado' ? 'pagado' : ''}">${(c as any).estado_pago_legible || c.estado_pago || 'Sin información de pago'}</span>
              ` : ''}
            </div>
          </div>
          
          <div class="day-card__footer">
            ${c.estado && c.estado.toLowerCase() === 'pendiente' ? `
            <div class="actions-section">
              <p class="actions-label">Acciones Principales</p>
              <div class="actions-row">
                <button class="btn-action success" data-action="aceptar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Aceptar Reserva
                </button>
                <button class="btn-action danger" data-action="rechazar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Rechazar
                </button>
              </div>
            </div>
            ` : ''}
            
            ${c.estado && c.estado.toLowerCase() === 'aceptada' && saldoPendiente > 0 ? `
            <div class="actions-section">
              <p class="actions-label">Gestión de Pagos</p>
              <div class="actions-row">
                <button class="btn-action primary" data-action="pago" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Registrar Pago
                </button>
              </div>
            </div>
            ` : ''}
            
            <div class="actions-section">
              <p class="actions-label">Información</p>
              <div class="actions-row">
                <button class="btn-action secondary" data-action="ver" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Ver Detalle
                </button>
                <button class="btn-action secondary" data-action="pdf" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Ver PDF
                </button>
                ${c.estado !== 'aceptada' && c.estado?.toLowerCase() !== 'rechazada' ? `
                <button class="btn-action secondary" data-action="editar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar
                </button>
                <button class="btn-action secondary" data-action="reenviar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Reenviar
                </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
        `
      }).join('')

      return `
        <div class="lista-day-section">
          <h3 class="lista-day-title">${fechaFormateada}</h3>
          <div class="day-list">
            ${cotizacionesHTML}
          </div>
        </div>
      `
    }).join('')

    listaContainer.innerHTML = html
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
        (c) => {
          const valorTotal = typeof c.totales?.valor_total === 'string' 
            ? parseFloat(c.totales.valor_total) 
            : (c.totales?.valor_total || 0)
          const totalPagado = typeof c.totales?.total_pagado === 'string'
            ? parseFloat(c.totales.total_pagado)
            : (c.totales?.total_pagado || 0)
          const abonoRequerido = typeof c.totales?.abono_requerido === 'string'
            ? parseFloat(c.totales.abono_requerido)
            : (c.totales?.abono_requerido || 0)
          const saldoPendiente = valorTotal - totalPagado
          const estadoClase = c.estado ? `estado-${c.estado.toLowerCase()}` : ''

          // Calculate end time
          const horaInicio = c.evento?.hora ?? '00:00'
          const duracion = c.evento?.duracion || 0
          const calcularHoraFin = (inicio: string, horas: number): string => {
            const [h, m] = inicio.split(':').map(Number)
            const totalMinutos = h * 60 + m + (horas * 60)
            const horaFin = Math.floor(totalMinutos / 60) % 24
            const minutosFin = totalMinutos % 60
            return `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`
          }
          const horaFin = calcularHoraFin(horaInicio, duracion)

          // Check if it's a socio quotation
          const esSocio = c.tipoCliente === 'socio'
          const estadoClass = esSocio ? `day-card--socio-${c.estado?.toLowerCase() || 'pendiente'}` : ''

          return `
        <div class="day-card ${estadoClass}">
          <div class="card-menu">
            <button class="card-menu__btn" data-id="${c.id}" title="Más opciones">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <div class="card-menu__dropdown" data-menu="${c.id}">
              <button class="card-menu__item" data-action="eliminar" data-id="${c.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
          <div class="day-card__header ${estadoClase}">
            <div class="day-card__title-section">
              <h3 class="day-card__title">
                ${c.cliente.nombre}
                <span style="font-weight: 400; font-size: 0.85rem; color: #64748b;">#${c.id}</span>
                ${esSocio ? '<span style="font-weight: 500; font-size: 0.8rem; color: #64748b;"> · Socio del Club</span>' : ''}
              </h3>
              <p class="day-card__subtitle">${c.cliente.email}</p>
            </div>
            <div class="day-card__salon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${c.evento?.salon ?? 'Salón'}
            </div>
          </div>
          
          <div class="day-card__body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Hora de Inicio</span>
                <span class="info-value">${horaInicio}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hora de Fin</span>
                <span class="info-value">${horaFin}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Duración</span>
                <span class="info-value">${duracion} horas</span>
              </div>
              <div class="info-item">
                <span class="info-label">Asistentes</span>
                <span class="info-value">${c.evento?.asistentes ?? 0} personas</span>
              </div>
              ${c.evento?.tipo ? `
              <div class="info-item">
                <span class="info-label">Tipo de Evento</span>
                <span class="info-value">${c.evento.tipo}</span>
              </div>
              ` : ''}
              ${c.cliente.telefono ? `
              <div class="info-item">
                <span class="info-label">Teléfono</span>
                <span class="info-value">${c.cliente.telefono}</span>
              </div>
              ` : ''}
            </div>
            
            ${c.estado && c.estado.toLowerCase() !== 'rechazada' ? `
            <div class="info-grid info-grid--financial">
              <div class="info-item">
                <span class="info-label">Valor Total</span>
                <span class="info-value highlight">${formatCurrency(valorTotal)}</span>
              </div>
              ${totalPagado > 0 ? `
              <div class="info-item">
                <span class="info-label">Total Pagado</span>
                <span class="info-value success">${formatCurrency(totalPagado)}</span>
              </div>
              ` : `
              <div class="info-item">
                <span class="info-label">Abono Requerido (50%)</span>
                <span class="info-value">${formatCurrency(abonoRequerido)}</span>
              </div>
              `}
              ${saldoPendiente > 0 ? `
              <div class="info-item">
                <span class="info-label">Saldo Pendiente</span>
                <span class="info-value warning">${formatCurrency(saldoPendiente)}</span>
              </div>
              ` : ''}
            </div>
            ` : `
            <div class="info-grid info-grid--financial">
              <div class="info-item">
                <span class="info-label">Valor Total</span>
                <span class="info-value highlight">${formatCurrency(valorTotal)}</span>
              </div>
            </div>
            `}
            
            <div class="status-row">
              <span class="badge badge-estado ${c.estado ? c.estado.toLowerCase() : ''}">${(c as any).estado_legible || c.estado || 'Sin estado'}</span>
              ${c.estado && c.estado.toLowerCase() !== 'rechazada' ? `
              <span class="badge badge-pago ${(c as any).estado_pago === 'pagado' ? 'pagado' : ''}">${(c as any).estado_pago_legible || c.estado_pago || 'Sin información de pago'}</span>
              ` : ''}
            </div>
          </div>
          
          <div class="day-card__footer">
            ${c.estado && c.estado.toLowerCase() === 'pendiente' ? `
            <div class="actions-section">
              <p class="actions-label">Acciones Principales</p>
              <div class="actions-row">
                <button class="btn-action success" data-action="aceptar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Aceptar Reserva
                </button>
                <button class="btn-action danger" data-action="rechazar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Rechazar
                </button>
              </div>
            </div>
            ` : ''}
            
            ${c.estado && c.estado.toLowerCase() === 'aceptada' && saldoPendiente > 0 ? `
            <div class="actions-section">
              <p class="actions-label">Gestión de Pagos</p>
              <div class="actions-row">
                <button class="btn-action primary" data-action="pago" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Registrar Pago
                </button>
              </div>
            </div>
            ` : ''}
            
            <div class="actions-section">
              <p class="actions-label">Información</p>
              <div class="actions-row">
                <button class="btn-action secondary" data-action="ver" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Ver Detalle
                </button>
                <button class="btn-action secondary" data-action="pdf" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Ver PDF
                </button>
                ${c.estado !== 'aceptada' && c.estado?.toLowerCase() !== 'rechazada' ? `
                <button class="btn-action secondary" data-action="editar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar
                </button>
                <button class="btn-action secondary" data-action="reenviar" data-id="${c.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Reenviar
                </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `
        }
      )
      .join('')
  }

  async function loadEspacios() {
    if (!salonSelect) return
    try {
      const data = await espaciosPublicosAPI.listarSimplificado()
      
      if (data.success && Array.isArray(data.data)) {
        // Limpiar opciones existentes excepto "Todos"
        salonSelect.innerHTML = '<option value="">Todos</option>'
        
        // Añadir opciones de espacios
        data.data.forEach((espacio: any) => {
          const option = document.createElement('option')
          option.value = espacio.id.toString()
          option.textContent = espacio.nombre
          salonSelect.appendChild(option)
        })
      }
    } catch (err) {
      console.error('Error cargando espacios:', err)
    }
  }

  async function loadCotizaciones() {
    if (!calendarDays) return
    calendarDays.innerHTML = '<div class="placeholder">Cargando...</div>'
    try {
      const resp = await cotizacionesAPI.listar({})
      allCotizaciones = resp.data || [] // Guardar todas sin filtrar
      rebuildEventos() // Aplicar filtros y construir eventos
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

  async function aceptarCotizacion(id: number) {
    const modal = new Modal()
    
    // First get the cotización to show total amounts
    try {
      const resp = await cotizacionesAPI.obtener(id)
      const c = resp.data
      const valorTotal = typeof c.totales?.subtotal === 'string' 
        ? parseFloat(c.totales.subtotal) 
        : (c.totales?.subtotal || 0)
      const abonoRequerido = typeof c.totales?.abono_50_porciento === 'string'
        ? parseFloat(c.totales.abono_50_porciento)
        : (c.totales?.abono_50_porciento || 0)

      const content = `
        <div class="modal-detail">
          <h2>Aceptar cotización #${c.id}</h2>
          <div class="detail-section">
            <p><strong>Valor total:</strong> ${formatCurrency(valorTotal)}</p>
            <p><strong>Abono requerido (50%):</strong> ${formatCurrency(abonoRequerido)}</p>
          </div>
          <div class="detail-section">
            <h3>Estado del pago</h3>
            <div style="margin-top: 1rem;">
              <label style="display: block; margin-bottom: 0.75rem; cursor: pointer;">
                <input type="radio" name="estadoPago" value="abonado" checked style="margin-right: 0.5rem;">
                Abonado 50% (${formatCurrency(abonoRequerido)})
              </label>
              <label style="display: block; margin-bottom: 0.75rem; cursor: pointer;">
                <input type="radio" name="estadoPago" value="pagado" style="margin-right: 0.5rem;">
                Pagado 100% (${formatCurrency(valorTotal)})
              </label>
              <label style="display: block; margin-bottom: 0.75rem; cursor: pointer;">
                <input type="radio" name="estadoPago" value="custom" style="margin-right: 0.5rem;">
                Monto personalizado
              </label>
            </div>
            <div id="customAmountField" style="display: none; margin-top: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Monto personalizado:</label>
              <input type="text" id="customAmount" class="form-input" placeholder="Ejemplo: 500,000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
              <p style="margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280;">Ingrese el monto en COP</p>
            </div>
          </div>
        </div>
      `

      modal.show(content, [
        { label: 'Cancelar', handler: () => {}, variant: 'secondary' },
        {
          label: 'Aceptar',
          handler: async () => {
            const selectedRadio = modal.modal.querySelector('input[name="estadoPago"]:checked') as HTMLInputElement
            const estadoPagoValue = selectedRadio?.value

            const payload: any = {}
            
            if (estadoPagoValue === 'abonado') {
              payload.estadoPago = 'abonado'
            } else if (estadoPagoValue === 'pagado') {
              payload.estadoPago = 'pagado'
            } else if (estadoPagoValue === 'custom') {
              const customInput = modal.modal.querySelector('#customAmount') as HTMLInputElement
              const customValue = customInput?.value.replace(/,/g, '') || '0'
              const customAmount = Number(customValue)
              if (customAmount <= 0) {
                const errorModal = new Modal()
                errorModal.alert('Debes ingresar un monto válido', 'error')
                return
              }
              // If custom amount >= total, mark as pagado, otherwise abonado
              payload.estadoPago = customAmount >= valorTotal ? 'pagado' : 'abonado'
              payload.montoPago = customAmount
            }

            try {
              modal.close()
              
              const loading = new LoadingOverlay()
              loading.show('Aceptando cotización...')
              
              await cotizacionesAPI.cerrar(id, payload)
              
              // Force immediate reload
              await loadCotizaciones()
              renderCalendar()
              renderDayList()
              if (vistaActual === 'lista') {
                renderListaView()
              }
              
              loading.hide()
              
              const successModal = new Modal()
              successModal.alert('Cotización aceptada y calendario bloqueado exitosamente.', 'success')
            } catch (err: any) {
              const loading = new LoadingOverlay()
              loading.hide()
              const errorModal = new Modal()
              errorModal.alert(err?.message || 'Error al aceptar la cotización', 'error')
            }
          },
          variant: 'primary'
        }
      ])

      // Show/hide custom amount field based on radio selection
      const radios = modal.modal.querySelectorAll('input[name="estadoPago"]')
      const customField = modal.modal.querySelector('#customAmountField') as HTMLElement
      const customInput = modal.modal.querySelector('#customAmount') as HTMLInputElement
      
      // Format currency input with commas
      if (customInput) {
        customInput.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement
          const value = target.value.replace(/,/g, '')
          if (value && !isNaN(Number(value))) {
            target.value = Number(value).toLocaleString('es-CO')
          }
        })
      }
      
      radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (target.value === 'custom') {
            customField.style.display = 'block'
            customInput?.focus()
          } else {
            customField.style.display = 'none'
          }
        })
      })
    } catch (err) {
      modal.alert('No se pudo obtener el detalle de la cotización', 'error')
    }
  }

  async function registrarPago(id: number) {
    const modal = new Modal()
    
    try {
      const resp = await cotizacionesAPI.obtener(id)
      const c = resp.data
      const valorTotal = typeof c.totales?.valor_total === 'string' 
        ? parseFloat(c.totales.valor_total) 
        : (c.totales?.valor_total || 0)
      const pagadoRaw = c.totales?.total_pagado || 0
      const pagado = typeof pagadoRaw === 'string' ? parseFloat(pagadoRaw) : pagadoRaw
      const pendiente = valorTotal - pagado

      const content = `
        <div class="modal-detail">
          <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 600;">Registrar pago - Cotización #${c.id}</h2>
          <div class="detail-section">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
              <div>
                <p style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Valor total</p>
                <p style="font-size: 1.125rem; font-weight: 700; color: #111827;">${formatCurrency(valorTotal)}</p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Pagado</p>
                <p style="font-size: 1.125rem; font-weight: 700; color: #059669;">${formatCurrency(pagado)}</p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Pendiente</p>
                <p style="font-size: 1.125rem; font-weight: 700; color: ${pendiente > 0 ? '#dc2626' : '#10b981'};">${formatCurrency(pendiente)}</p>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h3 style="margin: 0 0 1rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">¿Cuánto deseas registrar?</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
              ${pendiente > 0 ? `
              <label style="display: flex; align-items: center; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;" class="payment-option" data-selected="true">
                <input type="radio" name="montoPago" value="pendiente" checked style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; margin-bottom: 0.125rem;">Completar pago</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">Pagar el saldo pendiente completo</div>
                </div>
                <div style="font-size: 1.125rem; font-weight: 700; color: #059669;">${formatCurrency(pendiente)}</div>
              </label>
              ` : ''}
              ${pagado === 0 && valorTotal > 0 ? `
              <label style="display: flex; align-items: center; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;" class="payment-option">
                <input type="radio" name="montoPago" value="abono50" style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; margin-bottom: 0.125rem;">Abono del 50%</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">Pagar la mitad del valor total</div>
                </div>
                <div style="font-size: 1.125rem; font-weight: 700; color: #3b82f6;">${formatCurrency(valorTotal * 0.5)}</div>
              </label>
              ` : ''}
              <label style="display: flex; align-items: center; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;" class="payment-option" ${pendiente <= 0 ? 'data-selected="true"' : ''}>
                <input type="radio" name="montoPago" value="custom" ${pendiente <= 0 ? 'checked' : ''} style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; margin-bottom: 0.125rem;">Monto personalizado</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">Ingresa cualquier cantidad</div>
                </div>
              </label>
            </div>
            <div id="customAmountField" style="display: ${pendiente <= 0 ? 'block' : 'none'}; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem; color: #374151;">Monto a registrar</label>
              <div style="position: relative;">
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6b7280; font-weight: 500;">$</span>
                <input type="text" id="pagoAmount" class="form-input" placeholder="0" style="width: 100%; padding: 0.75rem 1rem 0.75rem 2rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1.125rem; font-weight: 600; transition: border-color 0.2s;">
              </div>
              <p style="margin-top: 0.75rem; font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 0.375rem;">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                Puedes registrar un abono parcial o incluso un cargo adicional
              </p>
            </div>
          </div>
        </div>
      `

      modal.show(content, [
        { label: 'Cancelar', handler: () => {}, variant: 'secondary' },
        {
          label: 'Registrar',
          handler: async () => {
            const selectedRadio = modal.modal.querySelector('input[name="montoPago"]:checked') as HTMLInputElement
            const montoPagoValue = selectedRadio?.value
            
            let montoNum = 0

            if (montoPagoValue === 'pendiente') {
              montoNum = pendiente
            } else if (montoPagoValue === 'abono50') {
              montoNum = valorTotal * 0.5
            } else if (montoPagoValue === 'custom') {
              const pagoInput = modal.modal.querySelector('#pagoAmount') as HTMLInputElement
              const pagoValue = pagoInput?.value.replace(/\./g, '') || '0'
              montoNum = Number(pagoValue)
            }
            
            if (montoNum <= 0) {
              const errorModal = new Modal()
              errorModal.alert('Debes ingresar un monto válido', 'error')
              return
            }
            
            // Validar que el monto total no exceda el valor total
            if (pagado + montoNum > valorTotal) {
              const errorModal = new Modal()
              errorModal.alert(`El monto total pagado ($${formatCurrency(pagado + montoNum)}) excedería el valor total ($${formatCurrency(valorTotal)})`, 'error')
              return
            }

            try {
              modal.close()
              
              const loading = new LoadingOverlay()
              loading.show('Registrando pago...')
              
              await cotizacionesAPI.registrarPago(id, { monto: montoNum })
              
              // Force immediate reload
              await loadCotizaciones()
              renderCalendar()
              renderDayList()
              if (vistaActual === 'lista') {
                renderListaView()
              }
              
              loading.hide()
              
              const successModal = new Modal()
              successModal.alert(`Pago de ${formatCurrency(montoNum)} registrado correctamente.`, 'success')
            } catch (err: any) {
              loading.hide()
              const errorModal = new Modal()
              errorModal.alert(err?.message || 'Error al registrar el pago', 'error')
            }
          },
          variant: 'primary'
        }
      ])

      // Show/hide custom amount field and update option styles
      const radios = modal.modal.querySelectorAll('input[name="montoPago"]')
      const customField = modal.modal.querySelector('#customAmountField') as HTMLElement
      const pagoInput = modal.modal.querySelector('#pagoAmount') as HTMLInputElement
      const paymentOptions = modal.modal.querySelectorAll('.payment-option')
      
      // Update option styles based on selection
      const updateOptionStyles = () => {
        paymentOptions.forEach(option => {
          const radio = option.querySelector('input[type="radio"]') as HTMLInputElement
          if (radio?.checked) {
            option.setAttribute('style', option.getAttribute('style')?.replace('border: 2px solid #e5e7eb', 'border: 2px solid #3b82f6; background: #eff6ff') || '')
          } else {
            option.setAttribute('style', option.getAttribute('style')?.replace('border: 2px solid #3b82f6; background: #eff6ff', 'border: 2px solid #e5e7eb').replace('background: #eff6ff', '') || '')
          }
        })
      }
      
      radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (target.value === 'custom') {
            customField.style.display = 'block'
            pagoInput?.focus()
          } else {
            customField.style.display = 'none'
          }
          updateOptionStyles()
        })
      })
      
      // Initial style update
      updateOptionStyles()

      // Format currency input
      if (pagoInput) {
        pagoInput.addEventListener('focus', (e) => {
          const target = e.target as HTMLInputElement
          target.style.borderColor = '#3b82f6'
        })
        
        pagoInput.addEventListener('blur', (e) => {
          const target = e.target as HTMLInputElement
          target.style.borderColor = '#d1d5db'
        })
        
        // Auto-format while typing
        pagoInput.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement
          // Remove all non-digits
          const rawValue = target.value.replace(/\D/g, '')
          
          if (rawValue === '') {
            target.value = ''
            return
          }
          
          // Format with thousand separators
          const numValue = parseInt(rawValue, 10)
          target.value = numValue.toLocaleString('es-CO')
          
          // Keep cursor at the end
          setTimeout(() => {
            target.setSelectionRange(target.value.length, target.value.length)
          }, 0)
        })
        
        // Focus if custom is pre-selected
        if (pendiente <= 0) {
          pagoInput.focus()
        }
      }
    } catch (err) {
      modal.alert('No se pudo obtener el detalle de la cotización', 'error')
    }
  }

  async function verCotizacion(id: number) {
    const modal = new Modal()
    try {
      const resp = await cotizacionesAPI.obtener(id)
      const c = resp.data
      const detalles = (c as any).detalles || []
      
      const valorTotal = typeof c.totales?.subtotal === 'string' 
        ? parseFloat(c.totales.subtotal) 
        : (c.totales?.subtotal || 0)
      const abonoRequerido = typeof c.totales?.abono_50_porciento === 'string'
        ? parseFloat(c.totales.abono_50_porciento)
        : (c.totales?.abono_50_porciento || 0)

      const content = `
        <div class="modal-detail">
          <h2>Cotización #${c.id}</h2>
          <div class="detail-section">
            <h3>Cliente</h3>
            <p><strong>Nombre:</strong> ${c.cliente.nombre}</p>
            <p><strong>Email:</strong> ${c.cliente.email}</p>
            ${c.cliente.telefono ? `<p><strong>Teléfono:</strong> ${c.cliente.telefono}</p>` : ''}
            ${c.tipoCliente ? `<p><strong>Tipo de cliente:</strong> ${c.tipoCliente === 'socio' ? 'Socio del club' : 'Particular'}</p>` : ''}
          </div>
          <div class="detail-section">
            <h3>Evento</h3>
            <p><strong>Fecha:</strong> ${c.evento.fecha}</p>
            <p><strong>Hora:</strong> ${c.evento.hora}</p>
            <p><strong>Duración:</strong> ${c.evento.duracion} horas</p>
            <p><strong>Asistentes:</strong> ${c.evento.asistentes} personas</p>
            <p><strong>Tipo:</strong> ${c.evento.tipo || 'No especificado'}</p>
          </div>
          <div class="detail-section">
            <h3>Detalles de la cotización</h3>
            ${detalles.map((d: any) => `
              <p><strong>${d.servicio}:</strong> ${d.cantidad} × ${formatCurrency(d.valorUnitario)} = ${formatCurrency(d.total)}</p>
            `).join('')}
          </div>
          <div class="detail-section detail-section--highlight">
            <h3>Totales</h3>
            <p><strong>Valor total:</strong> ${formatCurrency(valorTotal)}</p>
            <p><strong>Abono requerido (50%):</strong> ${formatCurrency(abonoRequerido)}</p>
          </div>
          <div class="detail-section">
            <h3>Estado</h3>
            <p><strong>Estado:</strong> <span class="badge badge--${c.estado}">${c.estado}</span></p>
            <p><strong>Estado de pago:</strong> <span class="badge badge--${c.estado_pago}">${c.estado_pago}</span></p>
          </div>
          ${c.observaciones ? `
          <div class="detail-section">
            <h3>Observaciones</h3>
            <p>${c.observaciones}</p>
          </div>
          ` : ''}
        </div>
      `
      modal.show(content, [{ label: 'Cerrar', handler: () => {}, variant: 'primary' }])
    } catch (err) {
      modal.alert('No se pudo obtener el detalle de la cotización', 'error')
    }
  }

  async function cerrarCotizacion(id: number, estadoPago: 'abonado' | 'pagado') {
    const modal = new Modal()
    modal.prompt(
      `Monto a registrar como ${estadoPago}`,
      'Deja vacío para usar el mínimo requerido',
      async (monto) => {
        if (monto === null) return // Usuario canceló

        const payload: any = { estadoPago }
        if (monto && monto.trim() !== '') {
          payload.montoPago = Number(monto)
        }

        try {
          await cotizacionesAPI.cerrar(id, payload)
          await loadCotizaciones()
          const successModal = new Modal()
          successModal.alert('Cotización cerrada y calendario bloqueado exitosamente.', 'success')
        } catch (err: any) {
          const errorModal = new Modal()
          errorModal.alert(err?.message || 'Error al cerrar la cotización', 'error')
        }
      }
    )
  }

  async function registrarPago(id: number) {
    const modal = new Modal()
    
    try {
      const resp = await cotizacionesAPI.obtener(id)
      const c = resp.data
      const valorTotal = typeof c.totales?.valor_total === 'string' 
        ? parseFloat(c.totales.valor_total) 
        : (c.totales?.valor_total || 0)
      const pagadoRaw = c.totales?.total_pagado || 0
      const pagado = typeof pagadoRaw === 'string' ? parseFloat(pagadoRaw) : pagadoRaw
      const pendiente = valorTotal - pagado

      const content = `
        <div class="modal-detail">
          <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 600;">Registrar pago - Cotización #${c.id}</h2>
          <div class="detail-section">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
              <div>
                <p style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Valor total</p>
                <p style="font-size: 1.125rem; font-weight: 700; color: #111827;">${formatCurrency(valorTotal)}</p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Pagado</p>
                <p style="font-size: 1.125rem; font-weight: 700; color: #059669;">${formatCurrency(pagado)}</p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Pendiente</p>
                <p style="font-size: 1.125rem; font-weight: 700; color: ${pendiente > 0 ? '#dc2626' : '#10b981'};">${formatCurrency(pendiente)}</p>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h3 style="margin: 0 0 1rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">¿Cuánto deseas registrar?</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
              ${pendiente > 0 ? `
              <label style="display: flex; align-items: center; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;" class="payment-option" data-selected="true">
                <input type="radio" name="montoPago" value="pendiente" checked style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; margin-bottom: 0.125rem;">Completar pago</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">Pagar el saldo pendiente completo</div>
                </div>
                <div style="font-size: 1.125rem; font-weight: 700; color: #059669;">${formatCurrency(pendiente)}</div>
              </label>
              ` : ''}
              <label style="display: flex; align-items: center; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;" class="payment-option" ${pendiente <= 0 ? 'data-selected="true"' : ''}>
                <input type="radio" name="montoPago" value="custom" ${pendiente <= 0 ? 'checked' : ''} style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; margin-bottom: 0.125rem;">Monto personalizado</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">Ingresa cualquier cantidad</div>
                </div>
              </label>
            </div>
            <div id="customAmountField" style="display: ${pendiente <= 0 ? 'block' : 'none'}; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem; color: #374151;">Monto a registrar</label>
              <div style="position: relative;">
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6b7280; font-weight: 500;">$</span>
                <input type="text" id="pagoAmount" class="form-input" placeholder="0" style="width: 100%; padding: 0.75rem 1rem 0.75rem 2rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1.125rem; font-weight: 600; transition: border-color 0.2s;">
              </div>
              <p style="margin-top: 0.75rem; font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 0.375rem;">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                Puedes registrar un abono parcial o incluso un cargo adicional
              </p>
            </div>
          </div>
        </div>
      `

      modal.show(content, [
        { label: 'Cancelar', handler: () => {}, variant: 'secondary' },
        {
          label: 'Registrar',
          handler: async () => {
            const selectedRadio = modal.modal.querySelector('input[name="montoPago"]:checked') as HTMLInputElement
            const montoPagoValue = selectedRadio?.value
            
            let montoNum = 0

            if (montoPagoValue === 'pendiente') {
              montoNum = pendiente
            } else if (montoPagoValue === 'custom') {
              const pagoInput = modal.modal.querySelector('#pagoAmount') as HTMLInputElement
              const pagoValue = pagoInput?.value.replace(/\./g, '') || '0'
              montoNum = Number(pagoValue)
            }
            
            if (montoNum <= 0) {
              const errorModal = new Modal()
              errorModal.alert('Debes ingresar un monto válido', 'error')
              return
            }
            
            // Validar que el monto total no exceda el valor total
            if (pagado + montoNum > valorTotal) {
              const errorModal = new Modal()
              errorModal.alert(`El monto total pagado ($${formatCurrency(pagado + montoNum)}) excedería el valor total ($${formatCurrency(valorTotal)})`, 'error')
              return
            }

            try {
              modal.close()
              
              const loading = new LoadingOverlay()
              loading.show('Registrando pago...')
              
              await cotizacionesAPI.registrarPago(id, { monto: montoNum })
              
              // Force immediate reload
              await loadCotizaciones()
              renderCalendar()
              renderDayList()
              if (vistaActual === 'lista') {
                renderListaView()
              }
              
              loading.hide()
              
              const successModal = new Modal()
              successModal.alert(`Pago de ${formatCurrency(montoNum)} registrado correctamente.`, 'success')
            } catch (err: any) {
              loading.hide()
              const errorModal = new Modal()
              errorModal.alert(err?.message || 'Error al registrar el pago', 'error')
            }
          },
          variant: 'primary'
        }
      ])

      // Show/hide custom amount field and update option styles
      const radios = modal.modal.querySelectorAll('input[name="montoPago"]')
      const customField = modal.modal.querySelector('#customAmountField') as HTMLElement
      const pagoInput = modal.modal.querySelector('#pagoAmount') as HTMLInputElement
      const paymentOptions = modal.modal.querySelectorAll('.payment-option')
      
      // Update option styles based on selection
      const updateOptionStyles = () => {
        paymentOptions.forEach(option => {
          const radio = option.querySelector('input[type="radio"]') as HTMLInputElement
          if (radio?.checked) {
            option.setAttribute('style', option.getAttribute('style')?.replace('border: 2px solid #e5e7eb', 'border: 2px solid #3b82f6; background: #eff6ff') || '')
          } else {
            option.setAttribute('style', option.getAttribute('style')?.replace('border: 2px solid #3b82f6; background: #eff6ff', 'border: 2px solid #e5e7eb').replace('background: #eff6ff', '') || '')
          }
        })
      }
      
      radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (target.value === 'custom') {
            customField.style.display = 'block'
            pagoInput?.focus()
          } else {
            customField.style.display = 'none'
          }
          updateOptionStyles()
        })
      })
      
      // Initial style update
      updateOptionStyles()

      // Format currency input
      if (pagoInput) {
        pagoInput.addEventListener('focus', (e) => {
          const target = e.target as HTMLInputElement
          target.style.borderColor = '#3b82f6'
        })
        
        pagoInput.addEventListener('blur', (e) => {
          const target = e.target as HTMLInputElement
          target.style.borderColor = '#d1d5db'
        })
        
        // Auto-format while typing
        pagoInput.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement
          // Remove all non-digits
          const rawValue = target.value.replace(/\D/g, '')
          
          if (rawValue === '') {
            target.value = ''
            return
          }
          
          // Format with thousand separators
          const numValue = parseInt(rawValue, 10)
          target.value = numValue.toLocaleString('es-CO')
          
          // Keep cursor at the end
          setTimeout(() => {
            target.setSelectionRange(target.value.length, target.value.length)
          }, 0)
        })
      }
    } catch (err) {
      modal.alert('No se pudo obtener el detalle de la cotización', 'error')
    }
  }

  async function rechazarCotizacion(id: number) {
    const modal = new Modal()
    modal.show(
      '<h3>¿Estás seguro de rechazar esta cotización?</h3><p>Esta acción notificará al cliente por correo.</p>',
      [
        { label: 'Cancelar', handler: () => {}, variant: 'secondary' },
        {
          label: 'Rechazar',
          handler: async () => {
            const modalMotivo = new Modal()
            modalMotivo.prompt(
              'Motivo del rechazo (opcional)',
              'Escribe el motivo...',
              async (motivo) => {
                try {
                  const loading = new LoadingOverlay()
                  loading.show('Rechazando cotización...')
                  
                  await cotizacionesAPI.rechazar(id, motivo || undefined)
                  await loadCotizaciones()
                  
                  renderCalendar()
                  renderDayList()
                  if (vistaActual === 'lista') {
                    renderListaView()
                  }
                  
                  loading.hide()
                  
                  const successModal = new Modal()
                  successModal.alert('Cotización rechazada. El cliente ha sido notificado.', 'success')
                } catch (err: any) {
                  const loading = new LoadingOverlay()
                  loading.hide()
                  const errorModal = new Modal()
                  errorModal.alert(err?.message || 'Error al rechazar la cotización', 'error')
                }
              }
            )
          },
          variant: 'danger',
        },
      ]
    )
  }

  function abrirPdf(id: number) {
    const url = cotizacionesAPI.getPdfUrl(id)
    window.open(url, '_blank')
  }

  // Removed abrirModalEditar - now using separate edit page
  // See /admin/reservas/[id]/editar.astro
  
  async function abrirModalEditar_DEPRECATED(id: number) {
    const modal = new Modal()
    const loading = new LoadingOverlay()
    loading.show('Cargando datos...')
    
    try {
      // Cargar cotización, espacios, disposiciones y servicios en paralelo
      const [respCotizacion, respEspacios, respServicios] = await Promise.all([
        cotizacionesAPI.obtener(id),
        fetch(`${API_URL}/api/espacios/publicos`).then(r => r.json()),
        fetch(`${API_URL}/api/servicios-adicionales`).then(r => r.json())
      ])

      const c = respCotizacion.data
      const espacios = respServicios.success ? respEspacios.data : []
      const servicios = respServicios.success ? respServicios.data : []

      loading.hide()

      // No permitir editar cotizaciones aceptadas
      if (c.estado === 'aceptada') {
        modal.alert('No se puede editar una cotización ya aceptada.', 'error')
        return
      }

      // Obtener servicios seleccionados de la cotización actual
      const serviciosActuales = (c as any).detalles
        ?.filter((d: any) => d.tipo === 'servicio_adicional')
        .map((d: any) => d.servicioAdicionalId) || []

      const content = `
        <div class="modal-edit-cotizacion">
          <h2 style="margin: 0 0 1.5rem; font-size: 1.4rem; font-weight: 700; color: #0f172a;">Editar Cotización #${c.id}</h2>
          
          <form id="editForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Paso 1: Salón y Configuración -->
            <div class="form-section-edit">
              <h3 style="margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; color: #334155;">1. Salón y Configuración</h3>
              
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Salón *</label>
                <select id="editEspacio" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem; background: white;">
                  <option value="">Selecciona un salón</option>
                  ${espacios.map((e: any) => `<option value="${e.id}" data-capacidad="${e.capacidadMaxima}" ${c.espacio.id === e.id ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                </select>
              </div>

              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Disposición del Salón *</label>
                <select id="editDisposicion" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem; background: white;">
                  <option value="">Cargando disposiciones...</option>
                </select>
              </div>
            </div>

            <!-- Paso 2: Fecha, Hora y Duración -->
            <div class="form-section-edit">
              <h3 style="margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; color: #334155;">2. Fecha y Hora</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Fecha del Evento *</label>
                  <input type="date" id="editFecha" value="${c.evento.fecha}" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Hora de Inicio *</label>
                  <input type="time" id="editHora" value="${c.evento.hora}" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Duración (horas) *</label>
                  <input type="number" id="editDuracion" value="${c.evento.duracion}" min="1" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;">
                  <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #64748b;">Mínimo 4h para clientes</small>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Hora Final</label>
                  <input type="text" id="editHoraFinal" readonly style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem; background: #f1f5f9; color: #64748b; cursor: not-allowed;">
                </div>
              </div>
            </div>

            <!-- Paso 3: Tipo de Evento y Asistentes -->
            <div class="form-section-edit">
              <h3 style="margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; color: #334155;">3. Tipo de Evento</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Tipo de Evento *</label>
                  <select id="editTipoEvento" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem; background: white;">
                    <option value="">Selecciona un tipo</option>
                    <option value="social" ${c.evento.tipo === 'social' ? 'selected' : ''}>Social (Matrimonio, Cumpleaños)</option>
                    <option value="empresarial" ${c.evento.tipo === 'empresarial' ? 'selected' : ''}>Empresarial (Conferencia)</option>
                    <option value="capacitacion" ${c.evento.tipo === 'capacitacion' ? 'selected' : ''}>Capacitación / Workshop</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Cantidad de Asistentes *</label>
                  <input type="number" id="editAsistentes" value="${c.evento.asistentes}" min="1" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;">
                </div>
              </div>
            </div>

            <!-- Paso 4: Servicios Adicionales -->
            <div class="form-section-edit">
              <h3 style="margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; color: #334155;">4. Servicios Adicionales</h3>
              
              <div id="editServiciosContainer" style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${servicios.map((s: any) => `
                  <label style="display: flex; align-items: center; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; cursor: pointer; transition: background 0.2s;">
                    <input type="checkbox" name="editServicios" value="${s.id}" ${serviciosActuales.includes(s.id) ? 'checked' : ''} style="margin-right: 0.5rem; width: 16px; height: 16px; cursor: pointer;">
                    <span style="font-size: 0.875rem; color: #334155;">${s.nombre}</span>
                  </label>
                `).join('')}
                ${servicios.length === 0 ? '<p style="color: #94a3b8; font-size: 0.875rem;">No hay servicios disponibles</p>' : ''}
              </div>
            </div>

            <!-- Paso 5: Información de Contacto -->
            <div class="form-section-edit">
              <h3 style="margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; color: #334155;">5. Información de Contacto</h3>
              
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Nombre de Contacto *</label>
                <input type="text" id="editNombre" value="${c.cliente.nombre}" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Email *</label>
                  <input type="email" id="editEmail" value="${c.cliente.email}" required style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Teléfono</label>
                  <input type="tel" id="editTelefono" value="${c.cliente.telefono || ''}" style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;">
                </div>
              </div>

              <div>
                <label style="display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.875rem; color: #475569;">Observaciones Adicionales</label>
                <textarea id="editObservaciones" rows="3" style="width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem; resize: vertical;">${c.observaciones || ''}</textarea>
              </div>
            </div>
          </form>
        </div>
      `

      modal.show(content, [
        {
          label: 'Cancelar',
          handler: () => {},
          variant: 'secondary'
        },
        {
          label: 'Guardar Cambios',
          handler: async () => {
            await guardarEdicionCotizacion(id)
          },
          variant: 'primary'
        }
      ])

      // Configurar comportamiento del formulario después de mostrarlo
      setTimeout(() => {
        configurarFormularioEdicion(c)
      }, 100)

    } catch (err: any) {
      loading.hide()
      modal.alert('No se pudo cargar los datos para editar la cotización.', 'error')
    }
  }

  function configurarFormularioEdicion(cotizacion: any) {
    const espacioSelect = document.getElementById('editEspacio') as HTMLSelectElement
    const disposicionSelect = document.getElementById('editDisposicion') as HTMLSelectElement
    const fechaInput = document.getElementById('editFecha') as HTMLInputElement
    const horaInput = document.getElementById('editHora') as HTMLInputElement
    const duracionInput = document.getElementById('editDuracion') as HTMLInputElement
    const horaFinalInput = document.getElementById('editHoraFinal') as HTMLInputElement

    // Función para calcular hora final
    const calcularHoraFinal = () => {
      if (!horaInput.value || !duracionInput.value) {
        horaFinalInput.value = 'Selecciona hora de inicio'
        return
      }
      
      const [horas, minutos] = horaInput.value.split(':').map(Number)
      const duracion = parseInt(duracionInput.value)
      let horaFinal = horas + duracion
      
      if (horaFinal >= 24) horaFinal = horaFinal - 24
      
      horaFinalInput.value = `${String(horaFinal).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
    }

    // Cargar disposiciones cuando cambia el espacio
    const cargarDisposiciones = async (espacioId: number, disposicionActualId?: number) => {
      try {
        const resp = await fetch(`${API_URL}/api/espacios/${espacioId}`)
        const data = await resp.json()
        
        if (data.success && data.data.configuraciones) {
          disposicionSelect.innerHTML = data.data.configuraciones
            .map((config: any) => `
              <option value="${config.id}" data-capacidad="${config.capacidadMaxima}">
                ${config.disposicion.nombre} (Max: ${config.capacidadMaxima} personas)
              </option>
            `).join('')
          
          // Seleccionar la disposición actual si existe
          if (disposicionActualId) {
            disposicionSelect.value = String(disposicionActualId)
          }
        }
      } catch (err) {
        console.error('Error cargando disposiciones:', err)
      }
    }

    // Event listeners
    espacioSelect.addEventListener('change', () => {
      const espacioId = parseInt(espacioSelect.value)
      if (espacioId) {
        cargarDisposiciones(espacioId)
      }
    })

    horaInput.addEventListener('change', calcularHoraFinal)
    duracionInput.addEventListener('change', calcularHoraFinal)

    // Inicializar
    cargarDisposiciones(cotizacion.espacio.id, cotizacion.configuracionEspacio?.id)
    calcularHoraFinal()
  }

  async function guardarEdicionCotizacion(id: number) {
    const espacioId = parseInt((document.getElementById('editEspacio') as HTMLSelectElement).value)
    const configuracionEspacioId = parseInt((document.getElementById('editDisposicion') as HTMLSelectElement).value)
    const fecha = (document.getElementById('editFecha') as HTMLInputElement).value
    const horaInicio = (document.getElementById('editHora') as HTMLInputElement).value
    const duracion = parseInt((document.getElementById('editDuracion') as HTMLInputElement).value)
    const tipoEvento = (document.getElementById('editTipoEvento') as HTMLSelectElement).value
    const asistentes = parseInt((document.getElementById('editAsistentes') as HTMLInputElement).value)
    const nombre = (document.getElementById('editNombre') as HTMLInputElement).value
    const email = (document.getElementById('editEmail') as HTMLInputElement).value
    const telefono = (document.getElementById('editTelefono') as HTMLInputElement).value
    const observaciones = (document.getElementById('editObservaciones') as HTMLTextAreaElement).value
    const servicios = Array.from(document.querySelectorAll('input[name="editServicios"]:checked'))
      .map((cb: any) => parseInt(cb.value))

    if (!espacioId || !configuracionEspacioId || !fecha || !horaInicio || !duracion || !tipoEvento || !asistentes || !nombre || !email) {
      const errorModal = new Modal()
      errorModal.alert('Por favor completa todos los campos requeridos.', 'error')
      return
    }

    const loading = new LoadingOverlay()
    loading.show('Actualizando cotización...')

    try {
      await cotizacionesAPI.actualizar(id, {
        espacioId,
        configuracionEspacioId,
        fecha,
        horaInicio,
        duracion,
        tipoEvento,
        asistentes,
        nombre,
        email,
        telefono: telefono.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
        servicios,
      })

      loading.hide()
      await loadCotizaciones()
      
      const successModal = new Modal()
      successModal.alert('Cotización actualizada exitosamente.', 'success')
    } catch (err: any) {
      loading.hide()
      const errorModal = new Modal()
      errorModal.alert(err?.message || 'Error al actualizar la cotización', 'error')
    }
  }

  async function reenviarNotificaciones(id: number) {
    const modal = new Modal()
    modal.show('<div style="text-align: center;"><div class="loader"></div><p style="margin-top: 1rem;">Enviando notificaciones...</p></div>', [])
    
    try {
      await cotizacionesAPI.reenviarCorreo(id)
      modal.close()
      const successModal = new Modal()
      successModal.alert('Notificaciones enviadas correctamente (Email y WhatsApp).', 'success')
    } catch (err: any) {
      modal.close()
      const errorModal = new Modal()
      errorModal.alert(err?.message || 'Error al enviar las notificaciones', 'error')
    }
  }

  async function eliminarCotizacion(id: number) {
    const modal = new Modal()
    modal.show(
      '<h3>¿Estás seguro de eliminar esta cotización?</h3><p style="color: #dc2626; font-weight: 500;">Esta acción no se puede deshacer.</p>',
      [
        { label: 'Cancelar', handler: () => {}, variant: 'secondary' },
        {
          label: 'Eliminar',
          handler: async () => {
            try {
              modal.close()
              
              const loading = new LoadingOverlay()
              loading.show('Eliminando cotización...')
              
              await cotizacionesAPI.eliminar(id)
              await loadCotizaciones()
              
              loading.hide()
              
              renderCalendar()
              renderDayList()
              if (vistaActual === 'lista') {
                renderListaView()
              }
              
              const successModal = new Modal()
              successModal.alert('Cotización eliminada correctamente.', 'success')
            } catch (err: any) {
              const loading = new LoadingOverlay()
              loading.hide()
              const errorModal = new Modal()
              errorModal.alert(err?.message || 'Error al eliminar la cotización', 'error')
            }
          },
          variant: 'danger',
        },
      ]
    )
  }

  dayList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    
    // Handle menu button clicks
    const menuBtn = target.closest('.card-menu__btn') as HTMLElement
    if (menuBtn) {
      const id = menuBtn.dataset.id
      const dropdown = document.querySelector(`[data-menu="${id}"]`) as HTMLElement
      if (dropdown) {
        // Close all other dropdowns
        document.querySelectorAll('.card-menu__dropdown').forEach(d => {
          if (d !== dropdown) d.classList.remove('show')
        })
        dropdown.classList.toggle('show')
      }
      return
    }
    
    const button = target.closest('button[data-action]') as HTMLElement
    if (!button?.dataset) return
    const action = button.dataset.action
    const id = Number(button.dataset.id)
    if (!action || !id) return
    
    // Close dropdown after action
    document.querySelectorAll('.card-menu__dropdown').forEach(d => d.classList.remove('show'))
    
    if (action === 'ver') verCotizacion(id)
    if (action === 'aceptar') aceptarCotizacion(id)
    if (action === 'abonado') cerrarCotizacion(id, 'abonado')
    if (action === 'pago') registrarPago(id)
    if (action === 'rechazar') rechazarCotizacion(id)
    if (action === 'pdf') abrirPdf(id)
    if (action === 'reenviar') reenviarNotificaciones(id)
    if (action === 'editar') window.location.href = `/admin/reservas/${id}/editar`
    if (action === 'eliminar') eliminarCotizacion(id)
  })

  // Event listener para la lista view
  listaContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    
    // Handle menu button clicks
    const menuBtn = target.closest('.card-menu__btn') as HTMLElement
    if (menuBtn) {
      const id = menuBtn.dataset.id
      const dropdown = document.querySelector(`[data-menu="${id}"]`) as HTMLElement
      if (dropdown) {
        // Close all other dropdowns
        document.querySelectorAll('.card-menu__dropdown').forEach(d => {
          if (d !== dropdown) d.classList.remove('show')
        })
        dropdown.classList.toggle('show')
      }
      return
    }
    
    const button = target.closest('button[data-action]') as HTMLElement
    if (!button?.dataset) return
    const action = button.dataset.action
    const id = Number(button.dataset.id)
    if (!action || !id) return
    
    // Close dropdown after action
    document.querySelectorAll('.card-menu__dropdown').forEach(d => d.classList.remove('show'))
    
    if (action === 'ver') verCotizacion(id)
    if (action === 'aceptar') aceptarCotizacion(id)
    if (action === 'abonado') cerrarCotizacion(id, 'abonado')
    if (action === 'pago') registrarPago(id)
    if (action === 'rechazar') rechazarCotizacion(id)
    if (action === 'pdf') abrirPdf(id)
    if (action === 'reenviar') reenviarNotificaciones(id)
    if (action === 'editar') abrirModalEditar(id)
    if (action === 'eliminar') eliminarCotizacion(id)
  })

  // Event listeners para alternar vistas
  btnVistaCalendario?.addEventListener('click', () => {
    vistaActual = 'calendario'
    btnVistaCalendario.classList.add('active')
    btnVistaLista?.classList.remove('active')
    vistaCalendario?.classList.add('active')
    vistaLista?.classList.remove('active')
    if (detalleDelDia) detalleDelDia.style.display = 'block'
    if (eyebrowVista) eyebrowVista.textContent = 'Calendario'
    // Ocultar selector de ordenamiento en vista calendario
    if (ordenSelect?.parentElement) {
      ordenSelect.parentElement.style.display = 'none'
    }
  })

  btnVistaLista?.addEventListener('click', () => {
    vistaActual = 'lista'
    btnVistaLista.classList.add('active')
    btnVistaCalendario?.classList.remove('active')
    vistaLista?.classList.add('active')
    vistaCalendario?.classList.remove('active')
    if (detalleDelDia) detalleDelDia.style.display = 'none'
    if (eyebrowVista) eyebrowVista.textContent = 'Lista'
    // Mostrar selector de ordenamiento en vista lista
    if (ordenSelect?.parentElement) {
      ordenSelect.parentElement.style.display = 'flex'
    }
    renderListaView()
  })

  // Aplicar filtros automáticamente al cambiar selects
  estadoSelect?.addEventListener('change', () => {
    rebuildEventos()
    // Si la fecha seleccionada quedó sin eventos tras filtrar, tomamos la primera disponible
    if (!selectedDate || !eventosPorFecha[selectedDate]?.length) {
      selectedDate = firstAvailableDate(Object.keys(eventosPorFecha))
    }
    renderCalendar()
    renderDayList()
    if (vistaActual === 'lista') {
      renderListaView()
    }
  })

  pagoSelect?.addEventListener('change', () => {
    rebuildEventos()
    // Si la fecha seleccionada quedó sin eventos tras filtrar, tomamos la primera disponible
    if (!selectedDate || !eventosPorFecha[selectedDate]?.length) {
      selectedDate = firstAvailableDate(Object.keys(eventosPorFecha))
    }
    renderCalendar()
    renderDayList()
    if (vistaActual === 'lista') {
      renderListaView()
    }
  })

  salonSelect?.addEventListener('change', () => {
    rebuildEventos()
    // Si la fecha seleccionada quedó sin eventos tras filtrar, tomamos la primera disponible
    if (!selectedDate || !eventosPorFecha[selectedDate]?.length) {
      selectedDate = firstAvailableDate(Object.keys(eventosPorFecha))
    }
    renderCalendar()
    renderDayList()
    if (vistaActual === 'lista') {
      renderListaView()
    }
  })

  // Búsqueda por ID en tiempo real
  buscarIdInput?.addEventListener('input', () => {
    rebuildEventos()
    // Si la fecha seleccionada quedó sin eventos tras filtrar, tomamos la primera disponible
    if (!selectedDate || !eventosPorFecha[selectedDate]?.length) {
      selectedDate = firstAvailableDate(Object.keys(eventosPorFecha))
    }
    renderCalendar()
    renderDayList()
    if (vistaActual === 'lista') {
      renderListaView()
    }
  })

  // Cambio de ordenamiento
  ordenSelect?.addEventListener('change', () => {
    if (vistaActual === 'lista') {
      renderListaView()
    }
  })

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.card-menu')) {
      document.querySelectorAll('.card-menu__dropdown').forEach(d => d.classList.remove('show'))
    }
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
  await loadEspacios()
  await loadCotizaciones()
  
  // Ocultar el selector de ordenamiento al inicio (vista calendario por defecto)
  if (ordenSelect?.parentElement) {
    ordenSelect.parentElement.style.display = 'none'
  }
}

window.addEventListener('DOMContentLoaded', () => {
  main().catch((err) => console.error('Error inicializando reservas admin', err))
})
