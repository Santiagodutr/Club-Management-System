import { cotizacionesAPI } from '../../services/api'
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

    // Ordenar por fecha más reciente primero
    const sortedCotizaciones = [...cotizaciones].sort((a, b) => {
      const dateA = new Date(a.evento?.fecha || 0).getTime()
      const dateB = new Date(b.evento?.fecha || 0).getTime()
      return dateB - dateA
    })

    const html = sortedCotizaciones
      .map((c) => {
        const valorTotal = Number(c.valor_total) || 0
        const abonoRequerido = valorTotal * 0.5
        const totalPagado = Number(c.monto_pagado) || 0
        const saldoPendiente = valorTotal - totalPagado

        const fecha = c.evento?.fecha ? new Date(c.evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : 'Fecha no especificada'

        return `
        <div class="day-card">
          <div class="day-card__header">
            <div>
              <div class="day-card__date">${fecha}</div>
              <div class="day-card__name">${c.cliente?.nombre || 'Sin nombre'}</div>
            </div>
            <span class="chip state-${stateClass(c.estado)}">${c.estado || 'Sin estado'}</span>
          </div>
          <div class="day-card__body">
            <div class="meta"><strong>Email:</strong> ${c.cliente?.email || 'N/A'}</div>
            ${c.cliente?.telefono ? `<div class="meta"><strong>Teléfono:</strong> ${c.cliente.telefono}</div>` : ''}
          </div>
          <div class="meta-row">
            <div class="meta"><strong>Hora:</strong> ${c.evento?.hora ?? ''}</div>
            <div class="meta"><strong>Duración:</strong> ${c.evento?.duracion || 0}h</div>
            <div class="meta"><strong>Asistentes:</strong> ${c.evento?.asistentes ?? 0} personas</div>
          </div>
          <div class="meta"><strong>Cotización #:</strong> ${c.id}</div>
          ${c.evento?.tipo ? `<div class="meta"><strong>Tipo de evento:</strong> ${c.evento.tipo}</div>` : ''}
          <div class="divider"></div>
          <div class="meta-row">
            <div class="meta"><strong>Valor total:</strong> ${formatCurrency(valorTotal)}</div>
            <div class="meta"><strong>Abono requerido (50%):</strong> ${formatCurrency(abonoRequerido)}</div>
          </div>
          ${totalPagado > 0 ? `
          <div class="meta-row">
            <div class="meta meta--highlight"><strong>Total pagado:</strong> ${formatCurrency(totalPagado)}</div>
            ${saldoPendiente > 0 ? `<div class="meta meta--warning"><strong>Saldo pendiente:</strong> ${formatCurrency(saldoPendiente)}</div>` : ''}
          </div>
          ` : ''}
          <div class="divider"></div>
          <div class="meta-row">
            <span class="tag state ${c.estado ? c.estado.toLowerCase() : ''}">${c.estado || 'Sin estado'}</span>
            <span class="tag pay">${c.estado_pago || 'Sin información de pago'}</span>
          </div>
          <div class="day-card__footer">
            <div class="day-card__actions day-card__actions--left">
              <button class="link" data-action="ver" data-id="${c.id}">Ver detalle</button>
              <button class="link" data-action="pdf" data-id="${c.id}">Ver PDF</button>
              <button class="link" data-action="correo" data-id="${c.id}">Reenviar correo</button>
            </div>
            <div class="day-card__actions day-card__actions--right">
              <button class="link" data-action="abonado" data-id="${c.id}">Registrar abonado</button>
              <button class="link" data-action="pago" data-id="${c.id}">Registrar pago</button>
              ${c.estado && c.estado.toLowerCase() !== 'aceptada' ? `
                <button class="link danger" data-action="rechazar" data-id="${c.id}">Rechazar</button>
              ` : ''}
            </div>
          </div>
        </div>
        `
      })
      .join('')

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

          return `
        <div class="day-card">
          <div class="day-card__header">
            <div class="day-card__title">${c.cliente.nombre}</div>
            <div class="tag">${c.evento?.salon ?? 'Salón'}</div>
          </div>
          <div class="day-card__body">
            <div class="meta-row">
              <div class="meta"><strong>Email:</strong> ${c.cliente.email}</div>
              ${c.cliente.telefono ? `<div class="meta"><strong>Teléfono:</strong> ${c.cliente.telefono}</div>` : ''}
            </div>
            <div class="meta-row">
              <div class="meta"><strong>Hora:</strong> ${c.evento?.hora ?? ''}</div>
              <div class="meta"><strong>Duración:</strong> ${c.evento?.duracion || 0}h</div>
              <div class="meta"><strong>Asistentes:</strong> ${c.evento?.asistentes ?? 0} personas</div>
            </div>
            <div class="meta"><strong>Cotización #:</strong> ${c.id}</div>
            ${c.evento?.tipo ? `<div class="meta"><strong>Tipo de evento:</strong> ${c.evento.tipo}</div>` : ''}
            <div class="divider"></div>
            <div class="meta-row">
              <div class="meta"><strong>Valor total:</strong> ${formatCurrency(valorTotal)}</div>
              <div class="meta"><strong>Abono requerido (50%):</strong> ${formatCurrency(abonoRequerido)}</div>
            </div>
            ${totalPagado > 0 ? `
            <div class="meta-row">
              <div class="meta meta--highlight"><strong>Total pagado:</strong> ${formatCurrency(totalPagado)}</div>
              ${saldoPendiente > 0 ? `<div class="meta meta--warning"><strong>Saldo pendiente:</strong> ${formatCurrency(saldoPendiente)}</div>` : ''}
            </div>
            ` : ''}
            <div class="divider"></div>
            <div class="meta-row">
              <span class="tag state ${c.estado ? c.estado.toLowerCase() : ''}">${c.estado || 'Sin estado'}</span>
              <span class="tag pay">${c.estado_pago || 'Sin información de pago'}</span>
            </div>
          </div>
          <div class="day-card__footer">
            <div class="day-card__actions day-card__actions--left">
              <button class="link" data-action="ver" data-id="${c.id}">Ver detalle</button>
              <button class="link" data-action="pdf" data-id="${c.id}">Ver PDF</button>
              <button class="link" data-action="correo" data-id="${c.id}">Reenviar correo</button>
            </div>
            <div class="day-card__actions day-card__actions--right">
              <button class="link" data-action="abonado" data-id="${c.id}">Registrar abonado</button>
              <button class="link" data-action="pago" data-id="${c.id}">Registrar pago</button>
              ${c.estado && c.estado.toLowerCase() !== 'aceptada' ? `
                <button class="link danger" data-action="rechazar" data-id="${c.id}">Rechazar</button>
              ` : ''}
            </div>
          </div>
        </div>
      `
        }
      )
      .join('')
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
          <h2>Cotización #${c.numero}</h2>
          <div class="detail-section">
            <h3>Cliente</h3>
            <p><strong>Nombre:</strong> ${c.cliente.nombre}</p>
            <p><strong>Email:</strong> ${c.cliente.email}</p>
            ${c.cliente.telefono ? `<p><strong>Teléfono:</strong> ${c.cliente.telefono}</p>` : ''}
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
    modal.prompt(
      'Registrar pago adicional',
      'Monto en COP',
      async (monto) => {
        if (!monto || monto.trim() === '') return

        try {
          await cotizacionesAPI.registrarPago(id, { monto: Number(monto) })
          await loadCotizaciones()
          const successModal = new Modal()
          successModal.alert(`Pago de ${formatCurrency(Number(monto))} registrado correctamente.`, 'success')
        } catch (err: any) {
          const errorModal = new Modal()
          errorModal.alert(err?.message || 'Error al registrar el pago', 'error')
        }
      }
    )
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
                  await cotizacionesAPI.rechazar(id, motivo || undefined)
                  await loadCotizaciones()
                  const successModal = new Modal()
                  successModal.alert('Cotización rechazada. El cliente ha sido notificado.', 'success')
                } catch (err: any) {
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

  async function reenviarCorreo(id: number) {
    const modal = new Modal()
    try {
      await cotizacionesAPI.reenviarCorreo(id)
      modal.alert('Correo reenviado correctamente al cliente.', 'success')
    } catch (err: any) {
      modal.alert(err?.message || 'Error al reenviar el correo', 'error')
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
    if (action === 'pago') registrarPago(id)
    if (action === 'rechazar') rechazarCotizacion(id)
    if (action === 'pdf') abrirPdf(id)
    if (action === 'correo') reenviarCorreo(id)
  })

  // Event listener para la lista view
  listaContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target?.dataset) return
    const action = target.dataset.action
    const id = Number(target.dataset.id)
    if (!action || !id) return
    if (action === 'ver') verCotizacion(id)
    if (action === 'abonado') cerrarCotizacion(id, 'abonado')
    if (action === 'pago') registrarPago(id)
    if (action === 'rechazar') rechazarCotizacion(id)
    if (action === 'pdf') abrirPdf(id)
    if (action === 'correo') reenviarCorreo(id)
  })

  // Event listeners para alternar vistas
  btnVistaCalendario?.addEventListener('click', () => {
    vistaActual = 'calendario'
    btnVistaCalendario.classList.add('active')
    btnVistaLista?.classList.remove('active')
    vistaCalendario?.classList.add('active')
    vistaLista?.classList.remove('active')
    if (detalleDelDia) detalleDelDia.style.display = 'block'
  })

  btnVistaLista?.addEventListener('click', () => {
    vistaActual = 'lista'
    btnVistaLista.classList.add('active')
    btnVistaCalendario?.classList.remove('active')
    vistaLista?.classList.add('active')
    vistaCalendario?.classList.remove('active')
    if (detalleDelDia) detalleDelDia.style.display = 'none'
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
