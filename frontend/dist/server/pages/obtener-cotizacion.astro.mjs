import { c as createComponent, d as renderComponent, r as renderTemplate, b as addAttribute, m as maybeRenderHead } from '../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CNFYT2Sv.mjs';
/* empty css                                              */
export { renderers } from '../renderers.mjs';

const millanuraImg = new Proxy({"src":"/_astro/millanura.BbpMHCtF.jpg","width":1600,"height":900,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/millanura.jpg";
							}
							
							return target[name];
						}
					});

const barImg = new Proxy({"src":"/_astro/bar.CTVT5oWx.jpg","width":1086,"height":1448,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/bar.jpg";
							}
							
							return target[name];
						}
					});

const empresarialImg = new Proxy({"src":"/_astro/empresarial.02G5Lnxl.jpg","width":1200,"height":1600,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/empresarial.jpg";
							}
							
							return target[name];
						}
					});

const terrazaImg = new Proxy({"src":"/_astro/terraza.C75resU0.jpg","width":1600,"height":1200,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/terraza.jpg";
							}
							
							return target[name];
						}
					});

const kioskoImg = new Proxy({"src":"/_astro/kiosko.pcdOycul.jpg","width":2048,"height":2048,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/kiosko.jpg";
							}
							
							return target[name];
						}
					});

const presidencialImg = new Proxy({"src":"/_astro/presidencial.B2VXJPTj.jpg","width":1200,"height":1600,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/presidencial.jpg";
							}
							
							return target[name];
						}
					});

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$ObtenerCotizacion = createComponent(async ($$result, $$props, $$slots) => {
  const imageMap = {
    "MI LLANURA": millanuraImg,
    "BAR": barImg,
    "EMPRESARIAL": empresarialImg,
    "TERRAZA": terrazaImg,
    "KIOSKO": kioskoImg,
    "PRESIDENTE": presidencialImg
  };
  const espacios = [
    { id: 1, nombre: "MI LLANURA", capacidadMaxima: 100 },
    { id: 2, nombre: "BAR", capacidadMaxima: 60 },
    { id: 3, nombre: "EMPRESARIAL", capacidadMaxima: 35 },
    { id: 4, nombre: "TERRAZA", capacidadMaxima: 30 },
    { id: 5, nombre: "KIOSKO", capacidadMaxima: 60 },
    { id: 6, nombre: "PRESIDENTE", capacidadMaxima: 15 }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Obtener cotizaci\xF3n - Club del Meta", "data-astro-cid-qdd752k2": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<section class="cotizacion" data-astro-cid-qdd752k2> <header class="cotizacion__header" data-astro-cid-qdd752k2> <h1 data-astro-cid-qdd752k2>Solicita tu cotizaci\xF3n</h1> <p data-astro-cid-qdd752k2>Selecciona el sal\xF3n, completa los datos y recibe tu propuesta personalizada al instante.</p> </header> <div class="cotizacion__container" data-astro-cid-qdd752k2> <aside class="cotizacion__media" data-astro-cid-qdd752k2> <img id="salon-image"', ' alt="Imagen del sal\xF3n seleccionado" data-astro-cid-qdd752k2> <div class="salon-info" data-astro-cid-qdd752k2> <h2 id="salon-title" data-astro-cid-qdd752k2>MI LLANURA</h2> <p id="salon-description" data-astro-cid-qdd752k2>Sal\xF3n insignia con vista a las \xE1reas verdes, ambientaci\xF3n adaptable. Ideal para recepciones, matrimonios y eventos corporativos.</p> <ul id="salon-features" data-astro-cid-qdd752k2> <li id="capacidad-info" data-astro-cid-qdd752k2>Capacidad: hasta 100 personas</li> <li id="precio-4h-info" data-astro-cid-qdd752k2>4 horas: Cargando...</li> <li id="precio-8h-info" data-astro-cid-qdd752k2>8 horas: Cargando...</li> </ul> </div> </aside> <main class="cotizacion__form" data-astro-cid-qdd752k2> <form id="cotizacion-form" data-astro-cid-qdd752k2> <!-- Paso 1: Selecci\xF3n del Sal\xF3n y Configuraci\xF3n --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>1. Sal\xF3n y Configuraci\xF3n</h3> <div class="field" data-astro-cid-qdd752k2> <label for="salon" data-astro-cid-qdd752k2>Sal\xF3n *</label> <select id="salon" name="salon" required data-astro-cid-qdd752k2> ', ` </select> </div> <div class="field" data-astro-cid-qdd752k2> <label for="disposicion" data-astro-cid-qdd752k2>Disposici\xF3n del Sal\xF3n *</label> <select id="disposicion" name="disposicion" required data-astro-cid-qdd752k2> <option value="" data-astro-cid-qdd752k2>Selecciona una disposici\xF3n</option> </select> </div> <!-- Secci\xF3n desplegable de explicaci\xF3n de disposiciones --> <details class="disposiciones-explicacion" id="disposiciones-info" data-astro-cid-qdd752k2> <summary data-astro-cid-qdd752k2> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-qdd752k2> <circle cx="12" cy="12" r="10" data-astro-cid-qdd752k2></circle> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" data-astro-cid-qdd752k2></path> <line x1="12" y1="17" x2="12.01" y2="17" data-astro-cid-qdd752k2></line> </svg>
\xBFQu\xE9 significan las disposiciones?
</summary> <div class="disposiciones-contenido" id="disposiciones-contenido" data-astro-cid-qdd752k2> <p style="text-align: center; color: #64748b;" data-astro-cid-qdd752k2>Cargando disposiciones...</p> </div> </details> </div> <!-- Paso 2: Fecha, Hora y Duraci\xF3n --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>2. Fecha y Hora</h3> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="date" data-astro-cid-qdd752k2>Fecha del Evento *</label> <input id="date" name="date" type="date" required data-astro-cid-qdd752k2> <small id="horario-info" style="display: none; margin-top: 0.5rem; padding: 0.75rem; background: #ecfdf5; border-left: 3px solid #10b981; color: #065f46; border-radius: 4px;" data-astro-cid-qdd752k2></small> </div> <div data-astro-cid-qdd752k2> <label for="time" data-astro-cid-qdd752k2>Hora de Inicio *</label> <select id="time" name="time" required disabled data-astro-cid-qdd752k2> <option value="" data-astro-cid-qdd752k2>Selecciona primero fecha y sal\xF3n</option> </select> <small id="horas-info" style="display: none; margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;" data-astro-cid-qdd752k2></small> </div> </div> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="duration" data-astro-cid-qdd752k2>Duraci\xF3n (horas) * - M\xEDnimo 4h, M\xE1ximo 8h</label> <input id="duration" name="duration" type="number" min="4" max="8" value="4" required data-astro-cid-qdd752k2> <small data-astro-cid-qdd752k2>Las horas adicionales a 8 se cobran por separado</small> </div> <div data-astro-cid-qdd752k2> <label data-astro-cid-qdd752k2>Hora Final</label> <input id="hora-final" type="text" readonly disabled style="background: #f3f4f6; color: #6b7280; cursor: not-allowed;" value="Selecciona hora de inicio" data-astro-cid-qdd752k2> <small id="duracion-info" style="display: none; margin-top: 0.5rem; font-size: 0.875rem; color: #10b981;" data-astro-cid-qdd752k2></small> </div> </div> </div> <!-- Paso 3: Tipo de Evento y Asistentes --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>3. Tipo de Evento</h3> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="tipoEvento" data-astro-cid-qdd752k2>Tipo de Evento *</label> <select id="tipoEvento" name="tipoEvento" required data-astro-cid-qdd752k2> <option value="" data-astro-cid-qdd752k2>Selecciona un tipo</option> <option value="social" data-astro-cid-qdd752k2>Social (Matrimonio, Cumplea\xF1os, Reuni\xF3n)</option> <option value="empresarial" data-astro-cid-qdd752k2>Empresarial (Conferencia, Reuni\xF3n)</option> <option value="capacitacion" data-astro-cid-qdd752k2>Capacitaci\xF3n / Workshop</option> </select> </div> <div data-astro-cid-qdd752k2> <label for="asistentes" data-astro-cid-qdd752k2>Cantidad de Asistentes * <span id="capacidad-info-text" data-astro-cid-qdd752k2></span></label> <input id="asistentes" name="asistentes" type="number" min="1" value="50" required data-astro-cid-qdd752k2> </div> </div> </div> <!-- Paso 4: Servicios Adicionales --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>4. Servicios Adicionales</h3> <div class="checkboxes" id="servicios-checkboxes" data-astro-cid-qdd752k2> <!-- Los servicios se cargar\xE1n desde el backend --> </div> </div> <!-- Paso 5: Informaci\xF3n de Contacto --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>5. Informaci\xF3n de Contacto</h3> <div class="field" data-astro-cid-qdd752k2> <label for="nombre" data-astro-cid-qdd752k2>Nombre de Contacto *</label> <input id="nombre" name="nombre" type="text" required data-astro-cid-qdd752k2> </div> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="email" data-astro-cid-qdd752k2>Email *</label> <input id="email" name="email" type="email" required data-astro-cid-qdd752k2> </div> <div data-astro-cid-qdd752k2> <label for="telefono" data-astro-cid-qdd752k2>Tel\xE9fono</label> <input id="telefono" name="telefono" type="tel" data-astro-cid-qdd752k2> </div> </div> <div class="field" data-astro-cid-qdd752k2> <label for="observaciones" data-astro-cid-qdd752k2>Observaciones Adicionales</label> <textarea id="observaciones" name="observaciones" rows="3" placeholder="Especifica detalles particulares de tu evento..." data-astro-cid-qdd752k2></textarea> </div> </div> <div class="actions" data-astro-cid-qdd752k2> <button type="submit" class="btn-primary" data-astro-cid-qdd752k2>Solicitar</button> <button type="reset" class="btn-secondary" data-astro-cid-qdd752k2>Limpiar Formulario</button> </div> </form> <!-- Mensaje de \xC9xito --> <div id="success-message" class="message success-message" hidden data-astro-cid-qdd752k2> <div class="message-header" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>\u2713 \xA1Cotizaci\xF3n Generada!</h3> </div> <div class="message-content" data-astro-cid-qdd752k2> <p data-astro-cid-qdd752k2><strong data-astro-cid-qdd752k2>N\xFAmero de Cotizaci\xF3n:</strong> <span id="cotizacion-numero" data-astro-cid-qdd752k2></span></p> <p data-astro-cid-qdd752k2><strong data-astro-cid-qdd752k2>Valor Total:</strong> <span id="cotizacion-total" data-astro-cid-qdd752k2></span></p> <p data-astro-cid-qdd752k2><strong data-astro-cid-qdd752k2>Monto de Abono (50%):</strong> <span id="cotizacion-abono" data-astro-cid-qdd752k2></span></p> </div> <div class="message-actions" data-astro-cid-qdd752k2> <button type="button" id="view-pdf-btn" class="btn-primary" data-astro-cid-qdd752k2>Ver Cotizaci\xF3n en PDF</button> <button type="button" id="download-pdf-btn" class="btn-secondary" data-astro-cid-qdd752k2>Descargar PDF</button> <button type="button" id="nueva-cotizacion-btn" class="btn-tertiary" data-astro-cid-qdd752k2>Hacer Otra Cotizaci\xF3n</button> </div> </div> <!-- Mensaje de Error --> <div id="error-message" class="modal-error" hidden data-astro-cid-qdd752k2> <div class="modal-error__overlay" data-astro-cid-qdd752k2></div> <div class="modal-error__content" data-astro-cid-qdd752k2> <button type="button" id="close-error-btn" class="modal-error__close" aria-label="Cerrar" data-astro-cid-qdd752k2>\u2715</button> <div class="modal-error__icon" data-astro-cid-qdd752k2>\u26A0</div> <h2 class="modal-error__title" data-astro-cid-qdd752k2>Algo Sali\xF3 Mal</h2> <p class="modal-error__message" id="error-text" data-astro-cid-qdd752k2></p> <div class="modal-error__actions" data-astro-cid-qdd752k2> <button type="button" id="retry-btn" class="btn-primary" data-astro-cid-qdd752k2>Intentar Nuevamente</button> </div> </div> </div> <!-- Modal de Confirmaci\xF3n --> <div id="confirmation-modal" class="modal-confirmation" hidden data-astro-cid-qdd752k2> <div class="modal-confirmation__overlay" data-astro-cid-qdd752k2></div> <div class="modal-confirmation__content" data-astro-cid-qdd752k2> <button type="button" id="close-confirmation-btn" class="modal-confirmation__close" aria-label="Cerrar" data-astro-cid-qdd752k2>\u2715</button> <div class="modal-confirmation__icon" data-astro-cid-qdd752k2>\u{1F4CB}</div> <h2 class="modal-confirmation__title" data-astro-cid-qdd752k2>Confirmar Solicitud</h2> <p class="modal-confirmation__subtitle" data-astro-cid-qdd752k2>Por favor revisa los datos antes de enviar tu solicitud:</p> <div class="modal-confirmation__details" data-astro-cid-qdd752k2> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Sal\xF3n:</span> <span class="detail-value" id="confirm-salon" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Fecha:</span> <span class="detail-value" id="confirm-fecha" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Hora de inicio:</span> <span class="detail-value" id="confirm-hora-inicio" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Hora de finalizaci\xF3n:</span> <span class="detail-value" id="confirm-hora-fin" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Duraci\xF3n:</span> <span class="detail-value" id="confirm-duracion" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Asistentes:</span> <span class="detail-value" id="confirm-asistentes" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" id="confirm-servicios-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Servicios adicionales:</span> <span class="detail-value" id="confirm-servicios" data-astro-cid-qdd752k2></span> </div> </div> <div class="modal-confirmation__actions" data-astro-cid-qdd752k2> <button type="button" id="cancel-confirmation-btn" class="btn-secondary" data-astro-cid-qdd752k2>Cancelar</button> <button type="button" id="submit-confirmation-btn" class="btn-primary" data-astro-cid-qdd752k2>Confirmar y Enviar</button> </div> </div> </div> </main> </div> </section>  <script type="module">
    const API_URL = 'http://localhost:3333'
    
    let currentCotizacionId = null

    // Elementos del DOM
    const salonSelect = document.getElementById('salon')
    const disposicionSelect = document.getElementById('disposicion')
    const form = document.getElementById('cotizacion-form')
    const successMessage = document.getElementById('success-message')
    const errorMessage = document.getElementById('error-message')
    const img = document.getElementById('salon-image')
    const title = document.getElementById('salon-title')
    const desc = document.getElementById('salon-description')
    const capacidadInfo = document.getElementById('capacidad-info')
    const precio4hInfo = document.getElementById('precio-4h-info')
    const precio8hInfo = document.getElementById('precio-8h-info')
    const asistentesInput = document.getElementById('asistentes')
    const capacidadInfoText = document.getElementById('capacidad-info-text')

    // Pre-seleccionar sal\xF3n desde URL si viene el par\xE1metro
    function preseleccionarSalonDesdeURL() {
      const urlParams = new URLSearchParams(window.location.search)
      const salonParam = urlParams.get('salon')
      
      if (salonParam) {
        console.log('Pre-seleccionando sal\xF3n desde URL:', salonParam)
        
        // Buscar la opci\xF3n que coincida con el nombre del sal\xF3n
        const opciones = salonSelect.options
        for (let i = 0; i < opciones.length; i++) {
          const opcionData = JSON.parse(opciones[i].value)
          if (opcionData.nombre.toLowerCase() === salonParam.toLowerCase()) {
            salonSelect.selectedIndex = i
            // Disparar el evento change para actualizar la UI
            salonSelect.dispatchEvent(new Event('change'))
            console.log('Sal\xF3n pre-seleccionado:', opcionData.nombre)
            break
          }
        }
      }
    }

    const descriptions = {
      'MI LLANURA': 'Sal\xF3n insignia con vista a las \xE1reas verdes, ambientaci\xF3n adaptable. Ideal para recepciones, matrimonios y eventos corporativos.',
      'BAR': 'Ambiente contempor\xE1neo con barra integrada, iluminaci\xF3n esc\xE9nica y sistema de sonido premium. Recomendado para cocteles y lanzamientos.',
      'EMPRESARIAL': 'Equipado con pantallas, streaming, mobiliario modular y conectividad para eventos corporativos, conferencias y workshops.',
      'TERRAZA': 'Espacio al aire libre con p\xE9rgolas y vistas; ideal para eventos sunset, bodas y recepciones.',
      'KIOSKO': '\xC1rea semiabierta rodeada de jardines, perfecta para reuniones familiares y celebraciones.',
      'PRESIDENTE': 'Espacio exclusivo con mobiliario ejecutivo, insonorizaci\xF3n y servicio gourmet para reuniones privadas.'
    }

    // CONFIGURACI\xD3N DE VALIDACI\xD3N DE FECHAS (modifica estos valores seg\xFAn necesites)
    const DIAS_MAXIMO_FUTURO = 30  // M\xE1ximo 30 d\xEDas (1 mes) en el futuro
    const PERMITIR_HOY = true       // true = permitir reservas para hoy, false = solo futuras

    // Configurar restricciones de fecha en el input
    function configurarRestriccionesFecha() {
      const dateInput = document.getElementById('date')
      const hoy = new Date()
      
      // Obtener fecha local en formato YYYY-MM-DD sin conversi\xF3n a UTC
      const year = hoy.getFullYear()
      const month = String(hoy.getMonth() + 1).padStart(2, '0')
      const day = String(hoy.getDate()).padStart(2, '0')
      const fechaHoyLocal = \`\${year}-\${month}-\${day}\`
      
      // Fecha m\xEDnima (hoy o ma\xF1ana)
      let minDate = fechaHoyLocal
      if (!PERMITIR_HOY) {
        const manana = new Date(hoy)
        manana.setDate(manana.getDate() + 1)
        const yearM = manana.getFullYear()
        const monthM = String(manana.getMonth() + 1).padStart(2, '0')
        const dayM = String(manana.getDate()).padStart(2, '0')
        minDate = \`\${yearM}-\${monthM}-\${dayM}\`
      }
      
      // Fecha m\xE1xima (hoy + DIAS_MAXIMO_FUTURO)
      const fechaMax = new Date(hoy)
      fechaMax.setDate(fechaMax.getDate() + DIAS_MAXIMO_FUTURO)
      const yearMax = fechaMax.getFullYear()
      const monthMax = String(fechaMax.getMonth() + 1).padStart(2, '0')
      const dayMax = String(fechaMax.getDate()).padStart(2, '0')
      const maxDate = \`\${yearMax}-\${monthMax}-\${dayMax}\`
      
      dateInput.setAttribute('min', minDate)
      dateInput.setAttribute('max', maxDate)
      
      console.log(\`\u{1F4C5} Restricciones de fecha: min=\${minDate}, max=\${maxDate}\`)
    }

    // Aplicar restricciones al cargar
    configurarRestriccionesFecha()

    // Horarios de operaci\xF3n (formato 24 horas)
    const horarios = {
      0: { nombre: 'Domingo', activo: false, inicio: '\u2014', fin: '\u2014' },
      1: { nombre: 'Lunes', activo: false, inicio: '\u2014', fin: '\u2014' },
      2: { nombre: 'Martes', activo: true, inicio: '08:00', fin: '22:00' },
      3: { nombre: 'Mi\xE9rcoles', activo: true, inicio: '08:00', fin: '22:00' },
      4: { nombre: 'Jueves', activo: true, inicio: '08:00', fin: '22:00' },
      5: { nombre: 'Viernes', activo: true, inicio: '08:00', fin: '02:00' }, // 02:00 = 2 AM (ma\xF1ana siguiente)
      6: { nombre: 'S\xE1bado', activo: true, inicio: '08:00', fin: '02:00' }  // 02:00 = 2 AM (ma\xF1ana siguiente)
    }

    // CARGAR DISPOSICIONES DEL ESPACIO
    async function cargarDisposicionesDelEspacio(espacioId) {
      try {
        console.log('Cargando disposiciones para espacio:', espacioId)
        disposicionSelect.innerHTML = '<option value="">Cargando...</option>'
        
        const response = await fetch(\`\${API_URL}/api/espacios/\${espacioId}/configuraciones\`)
        const result = await response.json()
        
        console.log('Respuesta configuraciones:', result)
        
        if (result.success && result.data && result.data.length > 0) {
          // Agregar opci\xF3n por defecto para obligar a seleccionar
          let html = '<option value="">Selecciona una disposici\xF3n</option>'
          
          result.data.forEach(config => {
            try {
              const disposicionNombre = config.disposicion?.nombre || 'Sin nombre'
              const capacidad = config.capacidad || 0
              html += \`<option value="\${config.id}" data-capacidad="\${capacidad}">
                \${disposicionNombre} (Capacidad: \${capacidad})
              </option>\`
            } catch (e) {
              console.error('Error procesando config:', config, e)
            }
          })
          
          disposicionSelect.innerHTML = html
          console.log('Disposiciones cargadas:', result.data.length)
          
          // Limpiar la informaci\xF3n de capacidad hasta que seleccionen una disposici\xF3n
          capacidadInfoText.textContent = ''
        } else {
          console.warn('Sin datos:', result)
          disposicionSelect.innerHTML = '<option value="">No hay disposiciones</option>'
        }
      } catch (error) {
        console.error('Error:', error)
        disposicionSelect.innerHTML = '<option value="">Error</option>'
      }
    }

    // ACTUALIZAR CAPACIDAD CUANDO CAMBIA DISPOSICI\xD3N
    function actualizarCapacidad() {
      const selected = disposicionSelect.selectedOptions[0]
      if (!selected || !selected.value) {
        // Si no hay disposici\xF3n seleccionada, limpiar la info de capacidad
        capacidadInfoText.textContent = ''
        return
      }
      
      const capacidad = parseInt(selected.dataset.capacidad)
      capacidadInfoText.textContent = \`(M\xE1x: \${capacidad})\`
      asistentesInput.max = capacidad
      
      if (parseInt(asistentesInput.value) > capacidad) {
        asistentesInput.value = capacidad
      }
    }

    // CARGAR SERVICIOS
    async function cargarServicios() {
      try {
        const response = await fetch(\`\${API_URL}/api/prestaciones\`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const container = document.getElementById('servicios-checkboxes')
          let html = ''
          result.data.forEach(s => {
            html += \`<label>
              <input type="checkbox" name="servicios" value="\${s.id}" />
              \${s.nombre}
            </label>\`
          })
          container.innerHTML = html
        }
      } catch (error) {
        console.error('Error cargando servicios:', error)
      }
    }

    // CARGAR DISPOSICIONES CON DESCRIPCIONES DEL SAL\xD3N ACTUAL
    async function cargarDisposicionesInfo(espacioId) {
      try {
        const response = await fetch(\`\${API_URL}/api/espacios/\${espacioId}/configuraciones\`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const container = document.getElementById('disposiciones-contenido')
          let html = ''
          
          result.data.forEach(config => {
            const disp = config.disposicion
            if (disp && disp.descripcion) {
              html += \`
                <div class="disposicion-card">
                  \${disp.imagen_url ? \`<img src="\${disp.imagen_url}" alt="\${disp.nombre}" class="disposicion-card-imagen" />\` : ''}
                  <strong class="disposicion-card-titulo">\${disp.nombre}</strong>
                  <div class="disposicion-card-descripcion">\${disp.descripcion}</div>
                </div>
              \`
            }
          })
          
          if (html) {
            container.innerHTML = html
          } else {
            container.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">No hay informaci\xF3n disponible</p>'
          }
        }
      } catch (error) {
        console.error('Error cargando disposiciones:', error)
        const container = document.getElementById('disposiciones-contenido')
        container.innerHTML = '<p style="text-align: center; color: #ef4444; grid-column: 1/-1;">Error al cargar las disposiciones</p>'
      }
    }

    // CARGAR TARIFAS DEL SAL\xD3N
    async function cargarTarifas(espacioId) {
      try {
        precio4hInfo.textContent = '4 horas: Cargando...'
        precio8hInfo.textContent = '8 horas: Cargando...'
        
        const response = await fetch(\`\${API_URL}/api/espacios/\${espacioId}/tarifas\`)
        const data = await response.json()
        
        if (data.success) {
          const precio4h = data.data.precio4Horas 
            ? \`$\${data.data.precio4Horas.toLocaleString('es-CO')}\` 
            : 'Consultar'
          const precio8h = data.data.precio8Horas 
            ? \`$\${data.data.precio8Horas.toLocaleString('es-CO')}\` 
            : 'Consultar'
          
          precio4hInfo.textContent = \`4 horas: \${precio4h}\`
          precio8hInfo.textContent = \`8 horas: \${precio8h}\`
        }
      } catch (error) {
        console.error('Error cargando tarifas:', error)
      }
    }

    // CARGAR HORAS DISPONIBLES
    async function cargarHorasDisponibles(espacioId, fecha, duracion = 4) {
      const timeSelect = document.getElementById('time')
      const horasInfo = document.getElementById('horas-info')
      
      try {
        console.log(\`Cargando horas para espacioId=\${espacioId}, fecha=\${fecha}, duracion=\${duracion}\`)
        timeSelect.innerHTML = '<option value="">Cargando horas...</option>'
        timeSelect.disabled = true
        horasInfo.style.display = 'none'
        
        const response = await fetch(\`\${API_URL}/api/disponibilidad/horas?espacioId=\${espacioId}&fecha=\${fecha}&duracion=\${duracion}\`)
        
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`)
        }
        
        const result = await response.json()
        console.log('Respuesta horas disponibles:', result)
        
        if (result.success && result.data) {
          const horas = result.data.horasDisponibles
          
          if (horas.length === 0) {
            timeSelect.innerHTML = '<option value="">No hay horas disponibles</option>'
            horasInfo.textContent = result.data.mensaje || 'No hay horarios disponibles para esta fecha'
            horasInfo.style.display = 'block'
            horasInfo.style.color = '#dc2626'
            console.log('\u26A0\uFE0F Sin horas disponibles')
            return
          }
          
          let html = '<option value="">Selecciona una hora</option>'
          horas.forEach(hora => {
            html += \`<option value="\${hora}">\${hora}</option>\`
          })
          timeSelect.innerHTML = html
          timeSelect.disabled = false
          
          horasInfo.textContent = \`\u2713 \${horas.length} horarios disponibles\`
          horasInfo.style.display = 'block'
          horasInfo.style.color = '#10b981'
          console.log(\`\u2705 \${horas.length} horas disponibles cargadas\`)
        } else {
          throw new Error(result.message || 'Respuesta inv\xE1lida del servidor')
        }
      } catch (error) {
        console.error('\u274C Error cargando horas:', error)
        timeSelect.innerHTML = '<option value="">Error al cargar (revisa servidor)</option>'
        horasInfo.textContent = 'Error: Verifica que el servidor backend est\xE9 corriendo'
        horasInfo.style.display = 'block'
        horasInfo.style.color = '#dc2626'
      }
    }

    // EVENT: CAMBIO DE SAL\xD3N
    salonSelect.addEventListener('change', async (e) => {
      try {
        const salonData = JSON.parse(e.target.value)
        const opt = e.target.selectedOptions[0]
        const imgSrc = opt.dataset.img
        const capacidad = opt.dataset.capacidad
        
        img.src = imgSrc
        title.textContent = salonData.nombre
        desc.textContent = descriptions[salonData.nombre] || ''
        capacidadInfo.textContent = \`Capacidad: hasta \${capacidad} personas\`
        
        // Cargar disposiciones del nuevo sal\xF3n
        cargarDisposicionesDelEspacio(salonData.id)
        
        // Cargar info de disposiciones del nuevo sal\xF3n
        cargarDisposicionesInfo(salonData.id)
        
        // Cargar tarifas del nuevo sal\xF3n
        cargarTarifas(salonData.id)
        
        // Cargar horas disponibles si ya hay fecha seleccionada
        const dateInput = document.getElementById('date')
        if (dateInput.value) {
          const durationInput = document.getElementById('duration')
          const duracion = durationInput.value ? parseInt(durationInput.value) : 4
          await cargarHorasDisponibles(salonData.id, dateInput.value, duracion)
        }
      } catch (error) {
        console.error('Error al cambiar sal\xF3n:', error)
      }
    })

    // EVENT: CAMBIO DE DISPOSICI\xD3N
    disposicionSelect.addEventListener('change', actualizarCapacidad)

    // EVENT: CAMBIO DE FECHA - MOSTRAR HORARIO Y CARGAR HORAS
    const dateInput = document.getElementById('date')
    const horarioInfo = document.getElementById('horario-info')
    
    dateInput.addEventListener('change', async () => {
      if (!dateInput.value) {
        horarioInfo.style.display = 'none'
        document.getElementById('time').innerHTML = '<option value="">Selecciona primero la fecha</option>'
        document.getElementById('time').disabled = true
        return
      }
      
      const date = new Date(dateInput.value + 'T00:00:00')
      const diaSemana = date.getDay()
      const horario = horarios[diaSemana]
      
      if (horario) {
        if (horario.activo) {
          // Formato 24 horas expl\xEDcito
          const horaInicioTexto = horario.inicio
          const horaFinTexto = horario.fin === '02:00' ? '02:00 ma\xF1ana siguiente' : horario.fin
          horarioInfo.innerHTML = \`<strong>\u{1F4C5} \${horario.nombre}</strong> - Horario: \${horaInicioTexto} a \${horaFinTexto}\`
          horarioInfo.style.background = '#ecfdf5'
          horarioInfo.style.borderLeftColor = '#10b981'
          horarioInfo.style.color = '#065f46'
        } else {
          horarioInfo.innerHTML = \`<strong>\u26D4 \${horario.nombre}</strong> - El club est\xE1 cerrado este d\xEDa\`
          horarioInfo.style.background = '#fef2f2'
          horarioInfo.style.borderLeftColor = '#dc2626'
          horarioInfo.style.color = '#991b1b'
          document.getElementById('time').innerHTML = '<option value="">Club cerrado este d\xEDa</option>'
          document.getElementById('time').disabled = true
          document.getElementById('horas-info').style.display = 'none'
          horarioInfo.style.display = 'block'
          return
        }
        horarioInfo.style.display = 'block'
      }
      
      // Cargar horas disponibles si hay sal\xF3n seleccionado
      const salonSelect = document.getElementById('salon')
      if (salonSelect.value) {
        const salonData = JSON.parse(salonSelect.value)
        const durationInput = document.getElementById('duration')
        const duracion = durationInput.value ? parseInt(durationInput.value) : 4
        await cargarHorasDisponibles(salonData.id, dateInput.value, duracion)
      } else {
        document.getElementById('time').innerHTML = '<option value="">Selecciona primero el sal\xF3n</option>'
        document.getElementById('time').disabled = true
      }
    })

    // CALCULAR Y MOSTRAR HORA FINAL
    function calcularHoraFinal() {
      const timeSelect = document.getElementById('time')
      const durationInput = document.getElementById('duration')
      const horaFinalInput = document.getElementById('hora-final')
      const duracionInfo = document.getElementById('duracion-info')
      
      // Limpiar si no hay hora de inicio
      if (!timeSelect.value || timeSelect.value === '' || !durationInput.value) {
        horaFinalInput.value = 'Selecciona hora de inicio'
        duracionInfo.style.display = 'none'
        return
      }
      
      const horaInicio = timeSelect.value // formato "HH:mm"
      const duracion = parseInt(durationInput.value)
      
      // Parsear hora de inicio
      const [horas, minutos] = horaInicio.split(':').map(Number)
      
      // Calcular hora final
      let horaFinal = horas + duracion
      const minutosFinal = minutos
      
      // Ajustar si pasa de 24 horas
      if (horaFinal >= 24) {
        horaFinal = horaFinal - 24
      }
      
      // Formatear hora final
      const horaFinalStr = \`\${String(horaFinal).padStart(2, '0')}:\${String(minutosFinal).padStart(2, '0')}\`
      
      horaFinalInput.value = horaFinalStr
      duracionInfo.style.display = 'none'
      
      console.log(\`\u{1F4C5} Hora calculada: \${horaInicio} + \${duracion}h = \${horaFinalStr}\`)
    }

    // EVENT: CAMBIO DE DURACI\xD3N - RECARGAR HORAS DISPONIBLES Y RECALCULAR HORA FINAL
    const durationInput = document.getElementById('duration')
    durationInput.addEventListener('change', async () => {
      const salonSelect = document.getElementById('salon')
      const dateInput = document.getElementById('date')
      const timeSelect = document.getElementById('time')
      
      // Validar m\xEDnimo 4 horas
      const duracionValue = parseInt(durationInput.value)
      if (duracionValue < 4) {
        alert('La duraci\xF3n m\xEDnima es de 4 horas')
        durationInput.value = 4
        return
      }
      
      // Validar m\xE1ximo 8 horas para clientes
      if (duracionValue > 8) {
        alert('La duraci\xF3n m\xE1xima para clientes es de 8 horas. Horas adicionales se cobran por separado.')
        durationInput.value = 8
        return
      }
      
      // Guardar la hora de inicio seleccionada antes de recargar
      const horaInicioPrevia = timeSelect.value
      
      // Recalcular hora final con la nueva duraci\xF3n
      calcularHoraFinal()
      
      // Solo recargar si ya hay sal\xF3n y fecha seleccionados
      if (salonSelect.value && dateInput.value) {
        const salonData = JSON.parse(salonSelect.value)
        const duracion = durationInput.value ? parseInt(durationInput.value) : 4
        await cargarHorasDisponibles(salonData.id, dateInput.value, duracion)
        
        // Restaurar la hora de inicio si sigue siendo v\xE1lida en las nuevas opciones
        if (horaInicioPrevia) {
          // Verificar si la hora previa existe en las nuevas opciones
          const options = Array.from(timeSelect.options).map(opt => opt.value)
          if (options.includes(horaInicioPrevia)) {
            timeSelect.value = horaInicioPrevia
            calcularHoraFinal() // Recalcular con la hora restaurada
          }
        }
      }
    })

    // EVENT: CAMBIO DE HORA DE INICIO - CALCULAR HORA FINAL
    const timeSelect = document.getElementById('time')
    timeSelect.addEventListener('change', () => {
      calcularHoraFinal()
    })

    // EVENT: VALIDAR ASISTENTES
    asistentesInput.addEventListener('change', () => {
      const selected = disposicionSelect.selectedOptions[0]
      if (!selected) return
      
      const capacidad = parseInt(selected.dataset.capacidad)
      const asistentes = parseInt(asistentesInput.value)
      
      if (asistentes > capacidad) {
        alert(\`M\xE1ximo \${capacidad} personas para esta disposici\xF3n\`)
        asistentesInput.value = capacidad
      }
    })

    // FUNCI\xD3N PARA MOSTRAR MODAL DE CONFIRMACI\xD3N
    function mostrarModalConfirmacion(salonData, servicios) {
      console.log('Mostrando modal de confirmaci\xF3n', salonData, servicios)
      const modal = document.getElementById('confirmation-modal')
      console.log('Modal element:', modal)
      
      // Llenar datos del modal
      document.getElementById('confirm-salon').textContent = salonData.nombre
      
      const fechaInput = document.getElementById('date').value
      const fecha = new Date(fechaInput + 'T00:00:00')
      const fechaFormateada = fecha.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      document.getElementById('confirm-fecha').textContent = fechaFormateada
      
      const horaInicio = document.getElementById('time').value
      document.getElementById('confirm-hora-inicio').textContent = horaInicio
      
      const horaFinElement = document.getElementById('hora-final')
      const horaFin = horaFinElement ? horaFinElement.value : 'No disponible'
      document.getElementById('confirm-hora-fin').textContent = horaFin
      
      const duracion = document.getElementById('duration').value
      document.getElementById('confirm-duracion').textContent = \`\${duracion} horas\`
      
      const asistentes = document.getElementById('asistentes').value
      document.getElementById('confirm-asistentes').textContent = asistentes
      
      // Servicios adicionales
      const serviciosRow = document.getElementById('confirm-servicios-row')
      if (servicios.length > 0) {
        const serviciosCheckboxes = Array.from(form.querySelectorAll('input[name="servicios"]:checked'))
        const serviciosNombres = serviciosCheckboxes.map(cb => cb.parentElement.textContent.trim())
        document.getElementById('confirm-servicios').textContent = serviciosNombres.join(', ')
        serviciosRow.style.display = 'flex'
      } else {
        serviciosRow.style.display = 'none'
      }
      
      modal.hidden = false
    }

    // FUNCI\xD3N PARA ENVIAR COTIZACI\xD3N
    async function enviarCotizacion() {
      const salonData = JSON.parse(salonSelect.value)
      const servicios = Array.from(form.querySelectorAll('input[name="servicios"]:checked')).map(i => parseInt(i.value))

      const cotizacionData = {
        espacioId: salonData.id,
        configuracionEspacioId: parseInt(disposicionSelect.value),
        fecha: document.getElementById('date').value,
        horaInicio: document.getElementById('time').value,
        duracion: parseInt(document.getElementById('duration').value),
        tipoEvento: document.getElementById('tipoEvento').value,
        asistentes: parseInt(asistentesInput.value),
        tipoCliente: 'particular',
        servicios,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value || undefined,
        observaciones: document.getElementById('observaciones').value || undefined,
      }

      successMessage.hidden = true
      errorMessage.hidden = true

      const submitBtn = form.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.disabled = true
      submitBtn.textContent = 'Enviando...'

      try {
        const response = await fetch(\`\${API_URL}/api/cotizaciones\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cotizacionData),
        })

        const result = await response.json()

        if (result.success && result.data) {
          // Verificar si hay disponibilidad
          if (!result.data.disponible) {
            document.getElementById('error-text').textContent = \`No hay disponibilidad: \${result.data.mensajeDisponibilidad || 'Fecha/hora no disponible'}\`
            errorMessage.hidden = false
            return
          }
          
          currentCotizacionId = result.data.cotizacion.id
          document.getElementById('cotizacion-numero').textContent = \`#\${result.data.cotizacion.cotizacionNumero}\`
          document.getElementById('cotizacion-total').textContent = \`$\${result.data.cotizacion.valorTotal.toLocaleString('es-CO')}\`
          document.getElementById('cotizacion-abono').textContent = \`$\${result.data.montoAbono.toLocaleString('es-CO')}\`
          
          successMessage.hidden = false
          form.style.display = 'none'
        } else {
          document.getElementById('error-text').textContent = result.message || 'Error'
          errorMessage.hidden = false
        }
      } catch (error) {
        document.getElementById('error-text').textContent = 'Error de conexi\xF3n'
        errorMessage.hidden = false
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    }

    // ENVIAR FORMULARIO
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      console.log('Form submitted')

      // VALIDAR
      if (!disposicionSelect.value) {
        alert('Selecciona una disposici\xF3n')
        return
      }

      const selected = disposicionSelect.selectedOptions[0]
      const capacidad = parseInt(selected.dataset.capacidad)
      const asistentes = parseInt(asistentesInput.value)
      
      console.log('Validando asistentes:', asistentes, 'capacidad:', capacidad)
      
      if (asistentes > capacidad) {
        alert(\`M\xE1ximo \${capacidad} personas\`)
        return
      }

      console.log('Parseando salonData...')
      const salonData = JSON.parse(salonSelect.value)
      const servicios = Array.from(form.querySelectorAll('input[name="servicios"]:checked')).map(i => parseInt(i.value))

      console.log('Llamando mostrarModalConfirmacion...')
      // Mostrar modal de confirmaci\xF3n
      mostrarModalConfirmacion(salonData, servicios)
    })

    // BOTONES DE ACCI\xD3N
    document.getElementById('view-pdf-btn')?.addEventListener('click', () => {
      if (currentCotizacionId) {
        window.open(\`\${API_URL}/api/cotizaciones/\${currentCotizacionId}/pdf\`, '_blank')
      }
    })

    document.getElementById('download-pdf-btn')?.addEventListener('click', () => {
      if (currentCotizacionId) {
        window.open(\`\${API_URL}/api/cotizaciones/\${currentCotizacionId}/pdf\`, '_blank')
      }
    })

    document.getElementById('nueva-cotizacion-btn')?.addEventListener('click', () => {
      form.style.display = 'block'
      form.reset()
      successMessage.hidden = true
      currentCotizacionId = null
      cargarDisposicionesDelEspacio(1) // Reset a MI LLANURA
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    // BOTONES DE ERROR MODAL
    document.getElementById('close-error-btn')?.addEventListener('click', () => {
      errorMessage.hidden = true
    })

    document.getElementById('retry-btn')?.addEventListener('click', () => {
      errorMessage.hidden = true
    })

    // BOTONES DE CONFIRMACI\xD3N MODAL
    const confirmationModal = document.getElementById('confirmation-modal')
    
    document.getElementById('close-confirmation-btn')?.addEventListener('click', () => {
      confirmationModal.hidden = true
    })

    document.getElementById('cancel-confirmation-btn')?.addEventListener('click', () => {
      confirmationModal.hidden = true
    })

    document.getElementById('submit-confirmation-btn')?.addEventListener('click', async () => {
      confirmationModal.hidden = true
      await enviarCotizacion()
    })

    // Cerrar modales al hacer clic en el overlay
    const errorModal = document.getElementById('error-message')
    if (errorModal) {
      errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal || e.target.classList.contains('modal-error__overlay')) {
          errorModal.hidden = true
        }
      })
    }

    if (confirmationModal) {
      confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal || e.target.classList.contains('modal-confirmation__overlay')) {
          confirmationModal.hidden = true
        }
      })
    }

    // INICIALIZAR
    console.log('Iniciando...')
    cargarServicios()
    
    // Pre-seleccionar sal\xF3n desde URL si viene el par\xE1metro
    preseleccionarSalonDesdeURL()
    
    // Cargar datos del sal\xF3n seleccionado (por defecto el primero o el pre-seleccionado)
    const salonInicial = JSON.parse(salonSelect.value)
    cargarTarifas(salonInicial.id)
    cargarDisposicionesDelEspacio(salonInicial.id)
    cargarDisposicionesInfo(salonInicial.id)
  <\/script> `], [" ", '<section class="cotizacion" data-astro-cid-qdd752k2> <header class="cotizacion__header" data-astro-cid-qdd752k2> <h1 data-astro-cid-qdd752k2>Solicita tu cotizaci\xF3n</h1> <p data-astro-cid-qdd752k2>Selecciona el sal\xF3n, completa los datos y recibe tu propuesta personalizada al instante.</p> </header> <div class="cotizacion__container" data-astro-cid-qdd752k2> <aside class="cotizacion__media" data-astro-cid-qdd752k2> <img id="salon-image"', ' alt="Imagen del sal\xF3n seleccionado" data-astro-cid-qdd752k2> <div class="salon-info" data-astro-cid-qdd752k2> <h2 id="salon-title" data-astro-cid-qdd752k2>MI LLANURA</h2> <p id="salon-description" data-astro-cid-qdd752k2>Sal\xF3n insignia con vista a las \xE1reas verdes, ambientaci\xF3n adaptable. Ideal para recepciones, matrimonios y eventos corporativos.</p> <ul id="salon-features" data-astro-cid-qdd752k2> <li id="capacidad-info" data-astro-cid-qdd752k2>Capacidad: hasta 100 personas</li> <li id="precio-4h-info" data-astro-cid-qdd752k2>4 horas: Cargando...</li> <li id="precio-8h-info" data-astro-cid-qdd752k2>8 horas: Cargando...</li> </ul> </div> </aside> <main class="cotizacion__form" data-astro-cid-qdd752k2> <form id="cotizacion-form" data-astro-cid-qdd752k2> <!-- Paso 1: Selecci\xF3n del Sal\xF3n y Configuraci\xF3n --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>1. Sal\xF3n y Configuraci\xF3n</h3> <div class="field" data-astro-cid-qdd752k2> <label for="salon" data-astro-cid-qdd752k2>Sal\xF3n *</label> <select id="salon" name="salon" required data-astro-cid-qdd752k2> ', ` </select> </div> <div class="field" data-astro-cid-qdd752k2> <label for="disposicion" data-astro-cid-qdd752k2>Disposici\xF3n del Sal\xF3n *</label> <select id="disposicion" name="disposicion" required data-astro-cid-qdd752k2> <option value="" data-astro-cid-qdd752k2>Selecciona una disposici\xF3n</option> </select> </div> <!-- Secci\xF3n desplegable de explicaci\xF3n de disposiciones --> <details class="disposiciones-explicacion" id="disposiciones-info" data-astro-cid-qdd752k2> <summary data-astro-cid-qdd752k2> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-qdd752k2> <circle cx="12" cy="12" r="10" data-astro-cid-qdd752k2></circle> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" data-astro-cid-qdd752k2></path> <line x1="12" y1="17" x2="12.01" y2="17" data-astro-cid-qdd752k2></line> </svg>
\xBFQu\xE9 significan las disposiciones?
</summary> <div class="disposiciones-contenido" id="disposiciones-contenido" data-astro-cid-qdd752k2> <p style="text-align: center; color: #64748b;" data-astro-cid-qdd752k2>Cargando disposiciones...</p> </div> </details> </div> <!-- Paso 2: Fecha, Hora y Duraci\xF3n --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>2. Fecha y Hora</h3> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="date" data-astro-cid-qdd752k2>Fecha del Evento *</label> <input id="date" name="date" type="date" required data-astro-cid-qdd752k2> <small id="horario-info" style="display: none; margin-top: 0.5rem; padding: 0.75rem; background: #ecfdf5; border-left: 3px solid #10b981; color: #065f46; border-radius: 4px;" data-astro-cid-qdd752k2></small> </div> <div data-astro-cid-qdd752k2> <label for="time" data-astro-cid-qdd752k2>Hora de Inicio *</label> <select id="time" name="time" required disabled data-astro-cid-qdd752k2> <option value="" data-astro-cid-qdd752k2>Selecciona primero fecha y sal\xF3n</option> </select> <small id="horas-info" style="display: none; margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;" data-astro-cid-qdd752k2></small> </div> </div> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="duration" data-astro-cid-qdd752k2>Duraci\xF3n (horas) * - M\xEDnimo 4h, M\xE1ximo 8h</label> <input id="duration" name="duration" type="number" min="4" max="8" value="4" required data-astro-cid-qdd752k2> <small data-astro-cid-qdd752k2>Las horas adicionales a 8 se cobran por separado</small> </div> <div data-astro-cid-qdd752k2> <label data-astro-cid-qdd752k2>Hora Final</label> <input id="hora-final" type="text" readonly disabled style="background: #f3f4f6; color: #6b7280; cursor: not-allowed;" value="Selecciona hora de inicio" data-astro-cid-qdd752k2> <small id="duracion-info" style="display: none; margin-top: 0.5rem; font-size: 0.875rem; color: #10b981;" data-astro-cid-qdd752k2></small> </div> </div> </div> <!-- Paso 3: Tipo de Evento y Asistentes --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>3. Tipo de Evento</h3> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="tipoEvento" data-astro-cid-qdd752k2>Tipo de Evento *</label> <select id="tipoEvento" name="tipoEvento" required data-astro-cid-qdd752k2> <option value="" data-astro-cid-qdd752k2>Selecciona un tipo</option> <option value="social" data-astro-cid-qdd752k2>Social (Matrimonio, Cumplea\xF1os, Reuni\xF3n)</option> <option value="empresarial" data-astro-cid-qdd752k2>Empresarial (Conferencia, Reuni\xF3n)</option> <option value="capacitacion" data-astro-cid-qdd752k2>Capacitaci\xF3n / Workshop</option> </select> </div> <div data-astro-cid-qdd752k2> <label for="asistentes" data-astro-cid-qdd752k2>Cantidad de Asistentes * <span id="capacidad-info-text" data-astro-cid-qdd752k2></span></label> <input id="asistentes" name="asistentes" type="number" min="1" value="50" required data-astro-cid-qdd752k2> </div> </div> </div> <!-- Paso 4: Servicios Adicionales --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>4. Servicios Adicionales</h3> <div class="checkboxes" id="servicios-checkboxes" data-astro-cid-qdd752k2> <!-- Los servicios se cargar\xE1n desde el backend --> </div> </div> <!-- Paso 5: Informaci\xF3n de Contacto --> <div class="form-section" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>5. Informaci\xF3n de Contacto</h3> <div class="field" data-astro-cid-qdd752k2> <label for="nombre" data-astro-cid-qdd752k2>Nombre de Contacto *</label> <input id="nombre" name="nombre" type="text" required data-astro-cid-qdd752k2> </div> <div class="field grid-2" data-astro-cid-qdd752k2> <div data-astro-cid-qdd752k2> <label for="email" data-astro-cid-qdd752k2>Email *</label> <input id="email" name="email" type="email" required data-astro-cid-qdd752k2> </div> <div data-astro-cid-qdd752k2> <label for="telefono" data-astro-cid-qdd752k2>Tel\xE9fono</label> <input id="telefono" name="telefono" type="tel" data-astro-cid-qdd752k2> </div> </div> <div class="field" data-astro-cid-qdd752k2> <label for="observaciones" data-astro-cid-qdd752k2>Observaciones Adicionales</label> <textarea id="observaciones" name="observaciones" rows="3" placeholder="Especifica detalles particulares de tu evento..." data-astro-cid-qdd752k2></textarea> </div> </div> <div class="actions" data-astro-cid-qdd752k2> <button type="submit" class="btn-primary" data-astro-cid-qdd752k2>Solicitar</button> <button type="reset" class="btn-secondary" data-astro-cid-qdd752k2>Limpiar Formulario</button> </div> </form> <!-- Mensaje de \xC9xito --> <div id="success-message" class="message success-message" hidden data-astro-cid-qdd752k2> <div class="message-header" data-astro-cid-qdd752k2> <h3 data-astro-cid-qdd752k2>\u2713 \xA1Cotizaci\xF3n Generada!</h3> </div> <div class="message-content" data-astro-cid-qdd752k2> <p data-astro-cid-qdd752k2><strong data-astro-cid-qdd752k2>N\xFAmero de Cotizaci\xF3n:</strong> <span id="cotizacion-numero" data-astro-cid-qdd752k2></span></p> <p data-astro-cid-qdd752k2><strong data-astro-cid-qdd752k2>Valor Total:</strong> <span id="cotizacion-total" data-astro-cid-qdd752k2></span></p> <p data-astro-cid-qdd752k2><strong data-astro-cid-qdd752k2>Monto de Abono (50%):</strong> <span id="cotizacion-abono" data-astro-cid-qdd752k2></span></p> </div> <div class="message-actions" data-astro-cid-qdd752k2> <button type="button" id="view-pdf-btn" class="btn-primary" data-astro-cid-qdd752k2>Ver Cotizaci\xF3n en PDF</button> <button type="button" id="download-pdf-btn" class="btn-secondary" data-astro-cid-qdd752k2>Descargar PDF</button> <button type="button" id="nueva-cotizacion-btn" class="btn-tertiary" data-astro-cid-qdd752k2>Hacer Otra Cotizaci\xF3n</button> </div> </div> <!-- Mensaje de Error --> <div id="error-message" class="modal-error" hidden data-astro-cid-qdd752k2> <div class="modal-error__overlay" data-astro-cid-qdd752k2></div> <div class="modal-error__content" data-astro-cid-qdd752k2> <button type="button" id="close-error-btn" class="modal-error__close" aria-label="Cerrar" data-astro-cid-qdd752k2>\u2715</button> <div class="modal-error__icon" data-astro-cid-qdd752k2>\u26A0</div> <h2 class="modal-error__title" data-astro-cid-qdd752k2>Algo Sali\xF3 Mal</h2> <p class="modal-error__message" id="error-text" data-astro-cid-qdd752k2></p> <div class="modal-error__actions" data-astro-cid-qdd752k2> <button type="button" id="retry-btn" class="btn-primary" data-astro-cid-qdd752k2>Intentar Nuevamente</button> </div> </div> </div> <!-- Modal de Confirmaci\xF3n --> <div id="confirmation-modal" class="modal-confirmation" hidden data-astro-cid-qdd752k2> <div class="modal-confirmation__overlay" data-astro-cid-qdd752k2></div> <div class="modal-confirmation__content" data-astro-cid-qdd752k2> <button type="button" id="close-confirmation-btn" class="modal-confirmation__close" aria-label="Cerrar" data-astro-cid-qdd752k2>\u2715</button> <div class="modal-confirmation__icon" data-astro-cid-qdd752k2>\u{1F4CB}</div> <h2 class="modal-confirmation__title" data-astro-cid-qdd752k2>Confirmar Solicitud</h2> <p class="modal-confirmation__subtitle" data-astro-cid-qdd752k2>Por favor revisa los datos antes de enviar tu solicitud:</p> <div class="modal-confirmation__details" data-astro-cid-qdd752k2> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Sal\xF3n:</span> <span class="detail-value" id="confirm-salon" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Fecha:</span> <span class="detail-value" id="confirm-fecha" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Hora de inicio:</span> <span class="detail-value" id="confirm-hora-inicio" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Hora de finalizaci\xF3n:</span> <span class="detail-value" id="confirm-hora-fin" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Duraci\xF3n:</span> <span class="detail-value" id="confirm-duracion" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Asistentes:</span> <span class="detail-value" id="confirm-asistentes" data-astro-cid-qdd752k2></span> </div> <div class="detail-row" id="confirm-servicios-row" data-astro-cid-qdd752k2> <span class="detail-label" data-astro-cid-qdd752k2>Servicios adicionales:</span> <span class="detail-value" id="confirm-servicios" data-astro-cid-qdd752k2></span> </div> </div> <div class="modal-confirmation__actions" data-astro-cid-qdd752k2> <button type="button" id="cancel-confirmation-btn" class="btn-secondary" data-astro-cid-qdd752k2>Cancelar</button> <button type="button" id="submit-confirmation-btn" class="btn-primary" data-astro-cid-qdd752k2>Confirmar y Enviar</button> </div> </div> </div> </main> </div> </section>  <script type="module">
    const API_URL = 'http://localhost:3333'
    
    let currentCotizacionId = null

    // Elementos del DOM
    const salonSelect = document.getElementById('salon')
    const disposicionSelect = document.getElementById('disposicion')
    const form = document.getElementById('cotizacion-form')
    const successMessage = document.getElementById('success-message')
    const errorMessage = document.getElementById('error-message')
    const img = document.getElementById('salon-image')
    const title = document.getElementById('salon-title')
    const desc = document.getElementById('salon-description')
    const capacidadInfo = document.getElementById('capacidad-info')
    const precio4hInfo = document.getElementById('precio-4h-info')
    const precio8hInfo = document.getElementById('precio-8h-info')
    const asistentesInput = document.getElementById('asistentes')
    const capacidadInfoText = document.getElementById('capacidad-info-text')

    // Pre-seleccionar sal\xF3n desde URL si viene el par\xE1metro
    function preseleccionarSalonDesdeURL() {
      const urlParams = new URLSearchParams(window.location.search)
      const salonParam = urlParams.get('salon')
      
      if (salonParam) {
        console.log('Pre-seleccionando sal\xF3n desde URL:', salonParam)
        
        // Buscar la opci\xF3n que coincida con el nombre del sal\xF3n
        const opciones = salonSelect.options
        for (let i = 0; i < opciones.length; i++) {
          const opcionData = JSON.parse(opciones[i].value)
          if (opcionData.nombre.toLowerCase() === salonParam.toLowerCase()) {
            salonSelect.selectedIndex = i
            // Disparar el evento change para actualizar la UI
            salonSelect.dispatchEvent(new Event('change'))
            console.log('Sal\xF3n pre-seleccionado:', opcionData.nombre)
            break
          }
        }
      }
    }

    const descriptions = {
      'MI LLANURA': 'Sal\xF3n insignia con vista a las \xE1reas verdes, ambientaci\xF3n adaptable. Ideal para recepciones, matrimonios y eventos corporativos.',
      'BAR': 'Ambiente contempor\xE1neo con barra integrada, iluminaci\xF3n esc\xE9nica y sistema de sonido premium. Recomendado para cocteles y lanzamientos.',
      'EMPRESARIAL': 'Equipado con pantallas, streaming, mobiliario modular y conectividad para eventos corporativos, conferencias y workshops.',
      'TERRAZA': 'Espacio al aire libre con p\xE9rgolas y vistas; ideal para eventos sunset, bodas y recepciones.',
      'KIOSKO': '\xC1rea semiabierta rodeada de jardines, perfecta para reuniones familiares y celebraciones.',
      'PRESIDENTE': 'Espacio exclusivo con mobiliario ejecutivo, insonorizaci\xF3n y servicio gourmet para reuniones privadas.'
    }

    // CONFIGURACI\xD3N DE VALIDACI\xD3N DE FECHAS (modifica estos valores seg\xFAn necesites)
    const DIAS_MAXIMO_FUTURO = 30  // M\xE1ximo 30 d\xEDas (1 mes) en el futuro
    const PERMITIR_HOY = true       // true = permitir reservas para hoy, false = solo futuras

    // Configurar restricciones de fecha en el input
    function configurarRestriccionesFecha() {
      const dateInput = document.getElementById('date')
      const hoy = new Date()
      
      // Obtener fecha local en formato YYYY-MM-DD sin conversi\xF3n a UTC
      const year = hoy.getFullYear()
      const month = String(hoy.getMonth() + 1).padStart(2, '0')
      const day = String(hoy.getDate()).padStart(2, '0')
      const fechaHoyLocal = \\\`\\\${year}-\\\${month}-\\\${day}\\\`
      
      // Fecha m\xEDnima (hoy o ma\xF1ana)
      let minDate = fechaHoyLocal
      if (!PERMITIR_HOY) {
        const manana = new Date(hoy)
        manana.setDate(manana.getDate() + 1)
        const yearM = manana.getFullYear()
        const monthM = String(manana.getMonth() + 1).padStart(2, '0')
        const dayM = String(manana.getDate()).padStart(2, '0')
        minDate = \\\`\\\${yearM}-\\\${monthM}-\\\${dayM}\\\`
      }
      
      // Fecha m\xE1xima (hoy + DIAS_MAXIMO_FUTURO)
      const fechaMax = new Date(hoy)
      fechaMax.setDate(fechaMax.getDate() + DIAS_MAXIMO_FUTURO)
      const yearMax = fechaMax.getFullYear()
      const monthMax = String(fechaMax.getMonth() + 1).padStart(2, '0')
      const dayMax = String(fechaMax.getDate()).padStart(2, '0')
      const maxDate = \\\`\\\${yearMax}-\\\${monthMax}-\\\${dayMax}\\\`
      
      dateInput.setAttribute('min', minDate)
      dateInput.setAttribute('max', maxDate)
      
      console.log(\\\`\u{1F4C5} Restricciones de fecha: min=\\\${minDate}, max=\\\${maxDate}\\\`)
    }

    // Aplicar restricciones al cargar
    configurarRestriccionesFecha()

    // Horarios de operaci\xF3n (formato 24 horas)
    const horarios = {
      0: { nombre: 'Domingo', activo: false, inicio: '\u2014', fin: '\u2014' },
      1: { nombre: 'Lunes', activo: false, inicio: '\u2014', fin: '\u2014' },
      2: { nombre: 'Martes', activo: true, inicio: '08:00', fin: '22:00' },
      3: { nombre: 'Mi\xE9rcoles', activo: true, inicio: '08:00', fin: '22:00' },
      4: { nombre: 'Jueves', activo: true, inicio: '08:00', fin: '22:00' },
      5: { nombre: 'Viernes', activo: true, inicio: '08:00', fin: '02:00' }, // 02:00 = 2 AM (ma\xF1ana siguiente)
      6: { nombre: 'S\xE1bado', activo: true, inicio: '08:00', fin: '02:00' }  // 02:00 = 2 AM (ma\xF1ana siguiente)
    }

    // CARGAR DISPOSICIONES DEL ESPACIO
    async function cargarDisposicionesDelEspacio(espacioId) {
      try {
        console.log('Cargando disposiciones para espacio:', espacioId)
        disposicionSelect.innerHTML = '<option value="">Cargando...</option>'
        
        const response = await fetch(\\\`\\\${API_URL}/api/espacios/\\\${espacioId}/configuraciones\\\`)
        const result = await response.json()
        
        console.log('Respuesta configuraciones:', result)
        
        if (result.success && result.data && result.data.length > 0) {
          // Agregar opci\xF3n por defecto para obligar a seleccionar
          let html = '<option value="">Selecciona una disposici\xF3n</option>'
          
          result.data.forEach(config => {
            try {
              const disposicionNombre = config.disposicion?.nombre || 'Sin nombre'
              const capacidad = config.capacidad || 0
              html += \\\`<option value="\\\${config.id}" data-capacidad="\\\${capacidad}">
                \\\${disposicionNombre} (Capacidad: \\\${capacidad})
              </option>\\\`
            } catch (e) {
              console.error('Error procesando config:', config, e)
            }
          })
          
          disposicionSelect.innerHTML = html
          console.log('Disposiciones cargadas:', result.data.length)
          
          // Limpiar la informaci\xF3n de capacidad hasta que seleccionen una disposici\xF3n
          capacidadInfoText.textContent = ''
        } else {
          console.warn('Sin datos:', result)
          disposicionSelect.innerHTML = '<option value="">No hay disposiciones</option>'
        }
      } catch (error) {
        console.error('Error:', error)
        disposicionSelect.innerHTML = '<option value="">Error</option>'
      }
    }

    // ACTUALIZAR CAPACIDAD CUANDO CAMBIA DISPOSICI\xD3N
    function actualizarCapacidad() {
      const selected = disposicionSelect.selectedOptions[0]
      if (!selected || !selected.value) {
        // Si no hay disposici\xF3n seleccionada, limpiar la info de capacidad
        capacidadInfoText.textContent = ''
        return
      }
      
      const capacidad = parseInt(selected.dataset.capacidad)
      capacidadInfoText.textContent = \\\`(M\xE1x: \\\${capacidad})\\\`
      asistentesInput.max = capacidad
      
      if (parseInt(asistentesInput.value) > capacidad) {
        asistentesInput.value = capacidad
      }
    }

    // CARGAR SERVICIOS
    async function cargarServicios() {
      try {
        const response = await fetch(\\\`\\\${API_URL}/api/prestaciones\\\`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const container = document.getElementById('servicios-checkboxes')
          let html = ''
          result.data.forEach(s => {
            html += \\\`<label>
              <input type="checkbox" name="servicios" value="\\\${s.id}" />
              \\\${s.nombre}
            </label>\\\`
          })
          container.innerHTML = html
        }
      } catch (error) {
        console.error('Error cargando servicios:', error)
      }
    }

    // CARGAR DISPOSICIONES CON DESCRIPCIONES DEL SAL\xD3N ACTUAL
    async function cargarDisposicionesInfo(espacioId) {
      try {
        const response = await fetch(\\\`\\\${API_URL}/api/espacios/\\\${espacioId}/configuraciones\\\`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const container = document.getElementById('disposiciones-contenido')
          let html = ''
          
          result.data.forEach(config => {
            const disp = config.disposicion
            if (disp && disp.descripcion) {
              html += \\\`
                <div class="disposicion-card">
                  \\\${disp.imagen_url ? \\\`<img src="\\\${disp.imagen_url}" alt="\\\${disp.nombre}" class="disposicion-card-imagen" />\\\` : ''}
                  <strong class="disposicion-card-titulo">\\\${disp.nombre}</strong>
                  <div class="disposicion-card-descripcion">\\\${disp.descripcion}</div>
                </div>
              \\\`
            }
          })
          
          if (html) {
            container.innerHTML = html
          } else {
            container.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">No hay informaci\xF3n disponible</p>'
          }
        }
      } catch (error) {
        console.error('Error cargando disposiciones:', error)
        const container = document.getElementById('disposiciones-contenido')
        container.innerHTML = '<p style="text-align: center; color: #ef4444; grid-column: 1/-1;">Error al cargar las disposiciones</p>'
      }
    }

    // CARGAR TARIFAS DEL SAL\xD3N
    async function cargarTarifas(espacioId) {
      try {
        precio4hInfo.textContent = '4 horas: Cargando...'
        precio8hInfo.textContent = '8 horas: Cargando...'
        
        const response = await fetch(\\\`\\\${API_URL}/api/espacios/\\\${espacioId}/tarifas\\\`)
        const data = await response.json()
        
        if (data.success) {
          const precio4h = data.data.precio4Horas 
            ? \\\`$\\\${data.data.precio4Horas.toLocaleString('es-CO')}\\\` 
            : 'Consultar'
          const precio8h = data.data.precio8Horas 
            ? \\\`$\\\${data.data.precio8Horas.toLocaleString('es-CO')}\\\` 
            : 'Consultar'
          
          precio4hInfo.textContent = \\\`4 horas: \\\${precio4h}\\\`
          precio8hInfo.textContent = \\\`8 horas: \\\${precio8h}\\\`
        }
      } catch (error) {
        console.error('Error cargando tarifas:', error)
      }
    }

    // CARGAR HORAS DISPONIBLES
    async function cargarHorasDisponibles(espacioId, fecha, duracion = 4) {
      const timeSelect = document.getElementById('time')
      const horasInfo = document.getElementById('horas-info')
      
      try {
        console.log(\\\`Cargando horas para espacioId=\\\${espacioId}, fecha=\\\${fecha}, duracion=\\\${duracion}\\\`)
        timeSelect.innerHTML = '<option value="">Cargando horas...</option>'
        timeSelect.disabled = true
        horasInfo.style.display = 'none'
        
        const response = await fetch(\\\`\\\${API_URL}/api/disponibilidad/horas?espacioId=\\\${espacioId}&fecha=\\\${fecha}&duracion=\\\${duracion}\\\`)
        
        if (!response.ok) {
          throw new Error(\\\`HTTP error! status: \\\${response.status}\\\`)
        }
        
        const result = await response.json()
        console.log('Respuesta horas disponibles:', result)
        
        if (result.success && result.data) {
          const horas = result.data.horasDisponibles
          
          if (horas.length === 0) {
            timeSelect.innerHTML = '<option value="">No hay horas disponibles</option>'
            horasInfo.textContent = result.data.mensaje || 'No hay horarios disponibles para esta fecha'
            horasInfo.style.display = 'block'
            horasInfo.style.color = '#dc2626'
            console.log('\u26A0\uFE0F Sin horas disponibles')
            return
          }
          
          let html = '<option value="">Selecciona una hora</option>'
          horas.forEach(hora => {
            html += \\\`<option value="\\\${hora}">\\\${hora}</option>\\\`
          })
          timeSelect.innerHTML = html
          timeSelect.disabled = false
          
          horasInfo.textContent = \\\`\u2713 \\\${horas.length} horarios disponibles\\\`
          horasInfo.style.display = 'block'
          horasInfo.style.color = '#10b981'
          console.log(\\\`\u2705 \\\${horas.length} horas disponibles cargadas\\\`)
        } else {
          throw new Error(result.message || 'Respuesta inv\xE1lida del servidor')
        }
      } catch (error) {
        console.error('\u274C Error cargando horas:', error)
        timeSelect.innerHTML = '<option value="">Error al cargar (revisa servidor)</option>'
        horasInfo.textContent = 'Error: Verifica que el servidor backend est\xE9 corriendo'
        horasInfo.style.display = 'block'
        horasInfo.style.color = '#dc2626'
      }
    }

    // EVENT: CAMBIO DE SAL\xD3N
    salonSelect.addEventListener('change', async (e) => {
      try {
        const salonData = JSON.parse(e.target.value)
        const opt = e.target.selectedOptions[0]
        const imgSrc = opt.dataset.img
        const capacidad = opt.dataset.capacidad
        
        img.src = imgSrc
        title.textContent = salonData.nombre
        desc.textContent = descriptions[salonData.nombre] || ''
        capacidadInfo.textContent = \\\`Capacidad: hasta \\\${capacidad} personas\\\`
        
        // Cargar disposiciones del nuevo sal\xF3n
        cargarDisposicionesDelEspacio(salonData.id)
        
        // Cargar info de disposiciones del nuevo sal\xF3n
        cargarDisposicionesInfo(salonData.id)
        
        // Cargar tarifas del nuevo sal\xF3n
        cargarTarifas(salonData.id)
        
        // Cargar horas disponibles si ya hay fecha seleccionada
        const dateInput = document.getElementById('date')
        if (dateInput.value) {
          const durationInput = document.getElementById('duration')
          const duracion = durationInput.value ? parseInt(durationInput.value) : 4
          await cargarHorasDisponibles(salonData.id, dateInput.value, duracion)
        }
      } catch (error) {
        console.error('Error al cambiar sal\xF3n:', error)
      }
    })

    // EVENT: CAMBIO DE DISPOSICI\xD3N
    disposicionSelect.addEventListener('change', actualizarCapacidad)

    // EVENT: CAMBIO DE FECHA - MOSTRAR HORARIO Y CARGAR HORAS
    const dateInput = document.getElementById('date')
    const horarioInfo = document.getElementById('horario-info')
    
    dateInput.addEventListener('change', async () => {
      if (!dateInput.value) {
        horarioInfo.style.display = 'none'
        document.getElementById('time').innerHTML = '<option value="">Selecciona primero la fecha</option>'
        document.getElementById('time').disabled = true
        return
      }
      
      const date = new Date(dateInput.value + 'T00:00:00')
      const diaSemana = date.getDay()
      const horario = horarios[diaSemana]
      
      if (horario) {
        if (horario.activo) {
          // Formato 24 horas expl\xEDcito
          const horaInicioTexto = horario.inicio
          const horaFinTexto = horario.fin === '02:00' ? '02:00 ma\xF1ana siguiente' : horario.fin
          horarioInfo.innerHTML = \\\`<strong>\u{1F4C5} \\\${horario.nombre}</strong> - Horario: \\\${horaInicioTexto} a \\\${horaFinTexto}\\\`
          horarioInfo.style.background = '#ecfdf5'
          horarioInfo.style.borderLeftColor = '#10b981'
          horarioInfo.style.color = '#065f46'
        } else {
          horarioInfo.innerHTML = \\\`<strong>\u26D4 \\\${horario.nombre}</strong> - El club est\xE1 cerrado este d\xEDa\\\`
          horarioInfo.style.background = '#fef2f2'
          horarioInfo.style.borderLeftColor = '#dc2626'
          horarioInfo.style.color = '#991b1b'
          document.getElementById('time').innerHTML = '<option value="">Club cerrado este d\xEDa</option>'
          document.getElementById('time').disabled = true
          document.getElementById('horas-info').style.display = 'none'
          horarioInfo.style.display = 'block'
          return
        }
        horarioInfo.style.display = 'block'
      }
      
      // Cargar horas disponibles si hay sal\xF3n seleccionado
      const salonSelect = document.getElementById('salon')
      if (salonSelect.value) {
        const salonData = JSON.parse(salonSelect.value)
        const durationInput = document.getElementById('duration')
        const duracion = durationInput.value ? parseInt(durationInput.value) : 4
        await cargarHorasDisponibles(salonData.id, dateInput.value, duracion)
      } else {
        document.getElementById('time').innerHTML = '<option value="">Selecciona primero el sal\xF3n</option>'
        document.getElementById('time').disabled = true
      }
    })

    // CALCULAR Y MOSTRAR HORA FINAL
    function calcularHoraFinal() {
      const timeSelect = document.getElementById('time')
      const durationInput = document.getElementById('duration')
      const horaFinalInput = document.getElementById('hora-final')
      const duracionInfo = document.getElementById('duracion-info')
      
      // Limpiar si no hay hora de inicio
      if (!timeSelect.value || timeSelect.value === '' || !durationInput.value) {
        horaFinalInput.value = 'Selecciona hora de inicio'
        duracionInfo.style.display = 'none'
        return
      }
      
      const horaInicio = timeSelect.value // formato "HH:mm"
      const duracion = parseInt(durationInput.value)
      
      // Parsear hora de inicio
      const [horas, minutos] = horaInicio.split(':').map(Number)
      
      // Calcular hora final
      let horaFinal = horas + duracion
      const minutosFinal = minutos
      
      // Ajustar si pasa de 24 horas
      if (horaFinal >= 24) {
        horaFinal = horaFinal - 24
      }
      
      // Formatear hora final
      const horaFinalStr = \\\`\\\${String(horaFinal).padStart(2, '0')}:\\\${String(minutosFinal).padStart(2, '0')}\\\`
      
      horaFinalInput.value = horaFinalStr
      duracionInfo.style.display = 'none'
      
      console.log(\\\`\u{1F4C5} Hora calculada: \\\${horaInicio} + \\\${duracion}h = \\\${horaFinalStr}\\\`)
    }

    // EVENT: CAMBIO DE DURACI\xD3N - RECARGAR HORAS DISPONIBLES Y RECALCULAR HORA FINAL
    const durationInput = document.getElementById('duration')
    durationInput.addEventListener('change', async () => {
      const salonSelect = document.getElementById('salon')
      const dateInput = document.getElementById('date')
      const timeSelect = document.getElementById('time')
      
      // Validar m\xEDnimo 4 horas
      const duracionValue = parseInt(durationInput.value)
      if (duracionValue < 4) {
        alert('La duraci\xF3n m\xEDnima es de 4 horas')
        durationInput.value = 4
        return
      }
      
      // Validar m\xE1ximo 8 horas para clientes
      if (duracionValue > 8) {
        alert('La duraci\xF3n m\xE1xima para clientes es de 8 horas. Horas adicionales se cobran por separado.')
        durationInput.value = 8
        return
      }
      
      // Guardar la hora de inicio seleccionada antes de recargar
      const horaInicioPrevia = timeSelect.value
      
      // Recalcular hora final con la nueva duraci\xF3n
      calcularHoraFinal()
      
      // Solo recargar si ya hay sal\xF3n y fecha seleccionados
      if (salonSelect.value && dateInput.value) {
        const salonData = JSON.parse(salonSelect.value)
        const duracion = durationInput.value ? parseInt(durationInput.value) : 4
        await cargarHorasDisponibles(salonData.id, dateInput.value, duracion)
        
        // Restaurar la hora de inicio si sigue siendo v\xE1lida en las nuevas opciones
        if (horaInicioPrevia) {
          // Verificar si la hora previa existe en las nuevas opciones
          const options = Array.from(timeSelect.options).map(opt => opt.value)
          if (options.includes(horaInicioPrevia)) {
            timeSelect.value = horaInicioPrevia
            calcularHoraFinal() // Recalcular con la hora restaurada
          }
        }
      }
    })

    // EVENT: CAMBIO DE HORA DE INICIO - CALCULAR HORA FINAL
    const timeSelect = document.getElementById('time')
    timeSelect.addEventListener('change', () => {
      calcularHoraFinal()
    })

    // EVENT: VALIDAR ASISTENTES
    asistentesInput.addEventListener('change', () => {
      const selected = disposicionSelect.selectedOptions[0]
      if (!selected) return
      
      const capacidad = parseInt(selected.dataset.capacidad)
      const asistentes = parseInt(asistentesInput.value)
      
      if (asistentes > capacidad) {
        alert(\\\`M\xE1ximo \\\${capacidad} personas para esta disposici\xF3n\\\`)
        asistentesInput.value = capacidad
      }
    })

    // FUNCI\xD3N PARA MOSTRAR MODAL DE CONFIRMACI\xD3N
    function mostrarModalConfirmacion(salonData, servicios) {
      console.log('Mostrando modal de confirmaci\xF3n', salonData, servicios)
      const modal = document.getElementById('confirmation-modal')
      console.log('Modal element:', modal)
      
      // Llenar datos del modal
      document.getElementById('confirm-salon').textContent = salonData.nombre
      
      const fechaInput = document.getElementById('date').value
      const fecha = new Date(fechaInput + 'T00:00:00')
      const fechaFormateada = fecha.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      document.getElementById('confirm-fecha').textContent = fechaFormateada
      
      const horaInicio = document.getElementById('time').value
      document.getElementById('confirm-hora-inicio').textContent = horaInicio
      
      const horaFinElement = document.getElementById('hora-final')
      const horaFin = horaFinElement ? horaFinElement.value : 'No disponible'
      document.getElementById('confirm-hora-fin').textContent = horaFin
      
      const duracion = document.getElementById('duration').value
      document.getElementById('confirm-duracion').textContent = \\\`\\\${duracion} horas\\\`
      
      const asistentes = document.getElementById('asistentes').value
      document.getElementById('confirm-asistentes').textContent = asistentes
      
      // Servicios adicionales
      const serviciosRow = document.getElementById('confirm-servicios-row')
      if (servicios.length > 0) {
        const serviciosCheckboxes = Array.from(form.querySelectorAll('input[name="servicios"]:checked'))
        const serviciosNombres = serviciosCheckboxes.map(cb => cb.parentElement.textContent.trim())
        document.getElementById('confirm-servicios').textContent = serviciosNombres.join(', ')
        serviciosRow.style.display = 'flex'
      } else {
        serviciosRow.style.display = 'none'
      }
      
      modal.hidden = false
    }

    // FUNCI\xD3N PARA ENVIAR COTIZACI\xD3N
    async function enviarCotizacion() {
      const salonData = JSON.parse(salonSelect.value)
      const servicios = Array.from(form.querySelectorAll('input[name="servicios"]:checked')).map(i => parseInt(i.value))

      const cotizacionData = {
        espacioId: salonData.id,
        configuracionEspacioId: parseInt(disposicionSelect.value),
        fecha: document.getElementById('date').value,
        horaInicio: document.getElementById('time').value,
        duracion: parseInt(document.getElementById('duration').value),
        tipoEvento: document.getElementById('tipoEvento').value,
        asistentes: parseInt(asistentesInput.value),
        tipoCliente: 'particular',
        servicios,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value || undefined,
        observaciones: document.getElementById('observaciones').value || undefined,
      }

      successMessage.hidden = true
      errorMessage.hidden = true

      const submitBtn = form.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.disabled = true
      submitBtn.textContent = 'Enviando...'

      try {
        const response = await fetch(\\\`\\\${API_URL}/api/cotizaciones\\\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cotizacionData),
        })

        const result = await response.json()

        if (result.success && result.data) {
          // Verificar si hay disponibilidad
          if (!result.data.disponible) {
            document.getElementById('error-text').textContent = \\\`No hay disponibilidad: \\\${result.data.mensajeDisponibilidad || 'Fecha/hora no disponible'}\\\`
            errorMessage.hidden = false
            return
          }
          
          currentCotizacionId = result.data.cotizacion.id
          document.getElementById('cotizacion-numero').textContent = \\\`#\\\${result.data.cotizacion.cotizacionNumero}\\\`
          document.getElementById('cotizacion-total').textContent = \\\`$\\\${result.data.cotizacion.valorTotal.toLocaleString('es-CO')}\\\`
          document.getElementById('cotizacion-abono').textContent = \\\`$\\\${result.data.montoAbono.toLocaleString('es-CO')}\\\`
          
          successMessage.hidden = false
          form.style.display = 'none'
        } else {
          document.getElementById('error-text').textContent = result.message || 'Error'
          errorMessage.hidden = false
        }
      } catch (error) {
        document.getElementById('error-text').textContent = 'Error de conexi\xF3n'
        errorMessage.hidden = false
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    }

    // ENVIAR FORMULARIO
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      console.log('Form submitted')

      // VALIDAR
      if (!disposicionSelect.value) {
        alert('Selecciona una disposici\xF3n')
        return
      }

      const selected = disposicionSelect.selectedOptions[0]
      const capacidad = parseInt(selected.dataset.capacidad)
      const asistentes = parseInt(asistentesInput.value)
      
      console.log('Validando asistentes:', asistentes, 'capacidad:', capacidad)
      
      if (asistentes > capacidad) {
        alert(\\\`M\xE1ximo \\\${capacidad} personas\\\`)
        return
      }

      console.log('Parseando salonData...')
      const salonData = JSON.parse(salonSelect.value)
      const servicios = Array.from(form.querySelectorAll('input[name="servicios"]:checked')).map(i => parseInt(i.value))

      console.log('Llamando mostrarModalConfirmacion...')
      // Mostrar modal de confirmaci\xF3n
      mostrarModalConfirmacion(salonData, servicios)
    })

    // BOTONES DE ACCI\xD3N
    document.getElementById('view-pdf-btn')?.addEventListener('click', () => {
      if (currentCotizacionId) {
        window.open(\\\`\\\${API_URL}/api/cotizaciones/\\\${currentCotizacionId}/pdf\\\`, '_blank')
      }
    })

    document.getElementById('download-pdf-btn')?.addEventListener('click', () => {
      if (currentCotizacionId) {
        window.open(\\\`\\\${API_URL}/api/cotizaciones/\\\${currentCotizacionId}/pdf\\\`, '_blank')
      }
    })

    document.getElementById('nueva-cotizacion-btn')?.addEventListener('click', () => {
      form.style.display = 'block'
      form.reset()
      successMessage.hidden = true
      currentCotizacionId = null
      cargarDisposicionesDelEspacio(1) // Reset a MI LLANURA
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    // BOTONES DE ERROR MODAL
    document.getElementById('close-error-btn')?.addEventListener('click', () => {
      errorMessage.hidden = true
    })

    document.getElementById('retry-btn')?.addEventListener('click', () => {
      errorMessage.hidden = true
    })

    // BOTONES DE CONFIRMACI\xD3N MODAL
    const confirmationModal = document.getElementById('confirmation-modal')
    
    document.getElementById('close-confirmation-btn')?.addEventListener('click', () => {
      confirmationModal.hidden = true
    })

    document.getElementById('cancel-confirmation-btn')?.addEventListener('click', () => {
      confirmationModal.hidden = true
    })

    document.getElementById('submit-confirmation-btn')?.addEventListener('click', async () => {
      confirmationModal.hidden = true
      await enviarCotizacion()
    })

    // Cerrar modales al hacer clic en el overlay
    const errorModal = document.getElementById('error-message')
    if (errorModal) {
      errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal || e.target.classList.contains('modal-error__overlay')) {
          errorModal.hidden = true
        }
      })
    }

    if (confirmationModal) {
      confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal || e.target.classList.contains('modal-confirmation__overlay')) {
          confirmationModal.hidden = true
        }
      })
    }

    // INICIALIZAR
    console.log('Iniciando...')
    cargarServicios()
    
    // Pre-seleccionar sal\xF3n desde URL si viene el par\xE1metro
    preseleccionarSalonDesdeURL()
    
    // Cargar datos del sal\xF3n seleccionado (por defecto el primero o el pre-seleccionado)
    const salonInicial = JSON.parse(salonSelect.value)
    cargarTarifas(salonInicial.id)
    cargarDisposicionesDelEspacio(salonInicial.id)
    cargarDisposicionesInfo(salonInicial.id)
  <\/script> `])), maybeRenderHead(), addAttribute(millanuraImg.src, "src"), espacios.map((espacio) => {
    const imgSrc = imageMap[espacio.nombre]?.src || millanuraImg.src;
    return renderTemplate`<option${addAttribute(JSON.stringify({ id: espacio.id, nombre: espacio.nombre }), "value")}${addAttribute(imgSrc, "data-img")}${addAttribute(espacio.capacidadMaxima, "data-capacidad")} data-astro-cid-qdd752k2> ${espacio.nombre} </option>`;
  })) })}`;
}, "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/obtener-cotizacion.astro", void 0);

const $$file = "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/obtener-cotizacion.astro";
const $$url = "/obtener-cotizacion";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$ObtenerCotizacion,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
