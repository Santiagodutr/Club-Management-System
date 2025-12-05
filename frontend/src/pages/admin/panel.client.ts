import {
  cotizacionesAPI,
  espaciosAdminAPI,
} from '../../services/api'
import { supabase } from '../../lib/supabase'

type Maybe<T> = T | null

function qs<T extends HTMLElement>(sel: string): Maybe<T> {
  return document.querySelector(sel) as Maybe<T>
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
  const cotizacionesTabla = qs<HTMLDivElement>('#cotizacionesTabla')
  const espaciosLista = qs<HTMLDivElement>('#espaciosLista')
  const btnNuevoEspacio = qs<HTMLButtonElement>('#btnNuevoEspacio')

  let cotizaciones: any[] = []
  let disposiciones: any[] = []
  let espacios: any[] = []

  const badge = (txt: string) => `<span class="badge">${txt}</span>`

  function renderCotizaciones() {
    if (!cotizacionesTabla) return
    if (!cotizaciones.length) {
      cotizacionesTabla.innerHTML = '<div class="placeholder">Sin cotizaciones con el filtro actual.</div>'
      return
    }

    cotizacionesTabla.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Evento</th>
            <th>Estado</th>
            <th>Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${cotizaciones
            .map(
              (c) => `
            <tr>
              <td>${c.numero}</td>
              <td>
                <div class="cell-strong">${c.cliente.nombre}</div>
                <div class="cell-muted">${c.cliente.email}${c.cliente.telefono ? ' · ' + c.cliente.telefono : ''}</div>
              </td>
              <td>
                <div class="cell-strong">${c.evento.fecha} · ${c.evento.hora}</div>
                <div class="cell-muted">${c.evento.salon ?? 'Salón'} · ${c.evento.asistentes} pax</div>
              </td>
              <td>${badge(c.estado)}</td>
              <td>${badge(c.estado_pago)}</td>
              <td class="actions-cell">
                <button class="link" data-action="ver" data-id="${c.id}">Ver</button>
                <button class="link" data-action="abonado" data-id="${c.id}">Cerrar abonado</button>
                <button class="link" data-action="pagado" data-id="${c.id}">Cerrar pagado</button>
                <button class="link" data-action="pago" data-id="${c.id}">Registrar pago</button>
                <button class="link danger" data-action="rechazar" data-id="${c.id}">Rechazar</button>
                <button class="link" data-action="pdf" data-id="${c.id}">PDF</button>
                <button class="link" data-action="correo" data-id="${c.id}">Reenviar correo</button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  async function loadCotizaciones() {
    if (!cotizacionesTabla) return
    cotizacionesTabla.innerHTML = '<div class="placeholder">Cargando...</div>'
    try {
      const filtros: Record<string, string> = {}
      if (estadoSelect?.value) filtros.estado = estadoSelect.value
      if (pagoSelect?.value) filtros.estado_pago = pagoSelect.value
      const resp = await cotizacionesAPI.listar(filtros)
      cotizaciones = resp.data || []
      renderCotizaciones()
    } catch (err) {
      console.error(err)
      cotizacionesTabla.innerHTML = '<div class="error">No se pudieron cargar las cotizaciones.</div>'
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

  function wireCotizacionesActions() {
    if (!cotizacionesTabla) return
    cotizacionesTabla.addEventListener('click', (e) => {
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
  }

  function renderEspacios() {
    if (!espaciosLista) return
    if (!espacios.length) {
      espaciosLista.innerHTML = '<div class="placeholder">Sin salones.</div>'
      return
    }

    espaciosLista.innerHTML = espacios
      .map(
        (e) => `
      <div class="space-card" data-id="${e.id}">
        <div class="space-card__header">
          <input class="space-input nombre" value="${e.nombre}" />
          <label class="switch">
            <input type="checkbox" class="activo" ${e.activo ? 'checked' : ''} />
            <span>Activo</span>
          </label>
        </div>
        <textarea class="space-input descripcion" rows="2" placeholder="Descripción">${e.descripcion ?? ''}</textarea>
        <div class="space-actions">
          <button class="btn secondary" data-action="guardar-espacio" data-id="${e.id}">Guardar</button>
        </div>
        <div class="configs">
          <div class="configs__header">
            <strong>Disposiciones</strong>
            <div class="add-config" data-id="${e.id}">
              <select class="disposicion-select">
                ${disposiciones.map((d: any) => `<option value="${d.id}">${d.nombre}</option>`).join('')}
              </select>
              <input type="number" min="1" class="capacidad-input" placeholder="Capacidad" />
              <button class="btn primary" data-action="agregar-config" data-id="${e.id}">Agregar</button>
            </div>
          </div>
          <div class="configs__list">
            ${e.configuraciones
              .map(
                (c: any) => `
              <div class="config-row" data-config-id="${c.id}" data-espacio-id="${e.id}">
                <span>${c.disposicionNombre ?? 'Disposición'} (${c.id})</span>
                <input type="number" min="1" class="capacidad" value="${c.capacidad}" />
                <div class="row-actions">
                  <button class="link" data-action="guardar-config" data-id="${c.id}" data-espacio="${e.id}">Guardar</button>
                  <button class="link danger" data-action="eliminar-config" data-id="${c.id}" data-espacio="${e.id}">Eliminar</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `
      )
      .join('')
  }

  async function loadDisposiciones() {
    try {
      const resp = await espaciosAdminAPI.listarDisposiciones()
      disposiciones = resp.data || []
    } catch (err) {
      console.error('Error disposiciones', err)
      disposiciones = []
    }
  }

  async function loadEspacios() {
    if (espaciosLista) espaciosLista.innerHTML = '<div class="placeholder">Cargando...</div>'
    try {
      const resp = await espaciosAdminAPI.listar()
      espacios = resp.data || []
      renderEspacios()
    } catch (err) {
      console.error(err)
      if (espaciosLista) espaciosLista.innerHTML = '<div class="error">No se pudieron cargar los salones.</div>'
    }
  }

  async function guardarEspacio(id: number) {
    const card = document.querySelector(`.space-card[data-id="${id}"]`) as HTMLElement
    if (!card) return
    const nombre = (card.querySelector('.nombre') as HTMLInputElement)?.value || ''
    const descripcion = (card.querySelector('.descripcion') as HTMLTextAreaElement)?.value || ''
    const activo = (card.querySelector('.activo') as HTMLInputElement)?.checked || false
    await espaciosAdminAPI.actualizar(id, { nombre, descripcion, activo })
    await loadEspacios()
    alert('Salón actualizado')
  }

  async function agregarConfig(espacioId: number, wrapper: Element) {
    const select = wrapper.querySelector('.disposicion-select') as HTMLSelectElement | null
    const capInput = wrapper.querySelector('.capacidad-input') as HTMLInputElement | null
    const disposicionId = Number(select?.value)
    const capacidad = Number(capInput?.value)
    if (!disposicionId || !capacidad) {
      alert('Selecciona disposición y capacidad')
      return
    }
    await espaciosAdminAPI.agregarConfiguracion(espacioId, { disposicionId, capacidad })
    await loadEspacios()
    alert('Configuración agregada')
  }

  async function guardarConfig(configId: number, espacioId: number, row: Element) {
    const capacidad = Number((row.querySelector('.capacidad') as HTMLInputElement | null)?.value)
    if (!capacidad) {
      alert('Capacidad requerida')
      return
    }
    await espaciosAdminAPI.actualizarConfiguracion(espacioId, configId, { capacidad })
    await loadEspacios()
    alert('Configuración actualizada')
  }

  async function eliminarConfig(configId: number, espacioId: number) {
    if (!confirm('¿Eliminar configuración?')) return
    await espaciosAdminAPI.eliminarConfiguracion(espacioId, configId)
    await loadEspacios()
    alert('Configuración eliminada')
  }

  async function crearEspacio() {
    const nombre = prompt('Nombre del salón:')
    if (!nombre) return
    const descripcion = prompt('Descripción (opcional):') || undefined
    await espaciosAdminAPI.crear({ nombre, descripcion })
    await loadEspacios()
    alert('Salón creado')
  }

  function wireEspaciosActions() {
    if (!espaciosLista) return
    espaciosLista.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (!target?.dataset) return
      const action = target.dataset.action
      if (!action) return
      if (action === 'guardar-espacio') {
        const id = Number(target.dataset.id)
        guardarEspacio(id)
      }
      if (action === 'agregar-config') {
        const espacioId = Number(target.dataset.id)
        const wrapper = target.closest('.add-config')
        if (wrapper) agregarConfig(espacioId, wrapper)
      }
      if (action === 'guardar-config') {
        const configId = Number(target.dataset.id)
        const espacioId = Number(target.dataset.espacio)
        const row = target.closest('.config-row')
        if (row) guardarConfig(configId, espacioId, row)
      }
      if (action === 'eliminar-config') {
        const configId = Number(target.dataset.id)
        const espacioId = Number(target.dataset.espacio)
        eliminarConfig(configId, espacioId)
      }
    })
  }

  wireCotizacionesActions()
  wireEspaciosActions()
  btnFiltrar?.addEventListener('click', loadCotizaciones)
  btnRefrescar?.addEventListener('click', () => {
    loadCotizaciones()
    loadEspacios()
  })
  btnNuevoEspacio?.addEventListener('click', crearEspacio)

  await ensureSession()
  await loadDisposiciones()
  await Promise.all([loadCotizaciones(), loadEspacios()])
}

window.addEventListener('DOMContentLoaded', () => {
  main().catch((err) => console.error('Error inicializando panel admin', err))
})
