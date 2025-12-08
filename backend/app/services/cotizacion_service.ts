import { DateTime } from 'luxon'
import Cotizacion, { DetalleCotizacion } from '#models/cotizacion'
import HorarioOperacion from '#models/horario_operacion'
import BloqueoCalendario from '#models/bloqueo_calendario'
import ServicioAdicional from '#models/servicio_adicional'
import Tarifa from '#models/tarifa'
import TarifaHoraAdicional from '#models/tarifa_hora_adicional'
import ConfiguracionEspacio from '#models/configuracion_espacio'
import Espacio from '#models/espacio'

export interface SolicitudCotizacion {
  espacioId: number
  configuracionEspacioId: number
  fecha: string // YYYY-MM-DD
  horaInicio: string // HH:mm
  duracion: number // horas
  tipoEvento: string // 'social', 'empresarial', 'capacitacion'
  asistentes: number
  tipoCliente: 'socio' | 'particular'
  servicios: number[] // IDs de servicios adicionales
  nombre: string
  email: string
  telefono?: string
  observaciones?: string
  codigoSocio?: string
}

export interface ResultadoCotizacion {
  cotizacion: Cotizacion
  detalles: DetalleCotizacion[]
  montoAbono: number
  disponible: boolean
  mensajeDisponibilidad: string
}

export class CotizacionService {
  /**
   * Convertir hora (HH:mm) a minutos desde medianoche
   */
  private static horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + (m || 0)
  }

  /**
   * Convertir minutos a formato HH:mm:ss
   */
  private static minutosAHora(minutos: number): string {
    const h = Math.floor(minutos / 60)
    const m = minutos % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  }

  /**
   * Validar si hay disponibilidad para una cotización
   */
  static async validarDisponibilidad(
    espacioId: number,
    fecha: string,
    horaInicio: string,
    duracion: number,
    tipoEvento: string
  ): Promise<{ disponible: boolean; mensaje: string; horaFin?: string; detalles?: any }> {
    try {
      const diaEval = new Date(`${fecha}T00:00:00`)
      const diaSemana = diaEval.getDay()

      console.log('Validando disponibilidad:', { espacioId, fecha, horaInicio, duracion, tipoEvento, diaSemana })

      // Obtener configuración de tiempos de montaje/desmontaje del espacio
      const espacio = await Espacio.find(espacioId)
      if (!espacio) {
        return {
          disponible: false,
          mensaje: 'Espacio no encontrado',
        }
      }

      const tiempoMontaje = espacio.tiempoMontajeHoras ?? 2
      const tiempoDesmontaje = espacio.tiempoDesmontajeHoras ?? 0

      console.log('Tiempos de montaje/desmontaje:', { 
        tiempoMontaje, 
        tiempoDesmontaje,
        tiempoMontajeDB: espacio.tiempoMontajeHoras,
        tiempoDesmontajeDB: espacio.tiempoDesmontajeHoras
      })

      // 1. Validar horario de operación
      const horario = await HorarioOperacion.findBy('dia_semana', diaSemana)
      if (!horario || !horario.estaActivo) {
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
        console.log(`Club cerrado: ${diasSemana[diaSemana]}`)
        return {
          disponible: false,
          mensaje: `El club no abre los ${diasSemana[diaSemana]}`,
        }
      }

      // 2. Validar duración mínima y máxima
      if (duracion < 4 || duracion > 8) {
        console.log(`Duración inválida: ${duracion}`)
        return {
          disponible: false,
          mensaje: `La duración debe ser entre 4 y 8 horas (ingresaste ${duracion} horas). Las horas adicionales se cobran por separado`,
        }
      }

      const minutosInicio = this.horaAMinutos(horaInicio)
      const minutosOpInicio = this.horaAMinutos(horario.horaInicio)
      const minutosOpFin = this.horaAMinutos(horario.horaFin)
      const horarioPasaMedianoche = minutosOpFin < minutosOpInicio
      let minutosFin = minutosInicio + duracion * 60
      const eventoFinalPasaMedianoche = minutosFin >= 1440
      if (eventoFinalPasaMedianoche) {
        minutosFin = minutosFin - 1440
      }

      // 3. Validar horario de inicio del evento (sin considerar montaje aún)
      if (minutosInicio < minutosOpInicio) {
        return {
          disponible: false,
          mensaje: `El evento no puede empezar antes de las ${horario.horaInicio} (apertura del club)`,
        }
      }

      if (horarioPasaMedianoche) {
        if (minutosInicio > minutosOpFin && minutosInicio < minutosOpInicio) {
          return {
            disponible: false,
            mensaje: `El club cierra a las ${horario.horaFin} y vuelve a abrir a las ${horario.horaInicio}`,
          }
        }
      } else {
        if (minutosInicio >= minutosOpFin) {
          return {
            disponible: false,
            mensaje: `El club cierra a las ${horario.horaFin}, no se puede empezar a las ${horaInicio}`,
          }
        }
      }

      // 4. Validar hora de fin del evento (sin considerar desmontaje aún)
      if (!horarioPasaMedianoche && !eventoFinalPasaMedianoche && minutosFin > minutosOpFin) {
        const horaFinFormato = this.minutosAHora(minutosFin).split(':').slice(0, 2).join(':')
        return {
          disponible: false,
          mensaje: `El evento terminaría a las ${horaFinFormato}, pero el club cierra a las ${horario.horaFin}`,
        }
      }

      if (horarioPasaMedianoche && eventoFinalPasaMedianoche) {
        if (minutosFin > minutosOpFin) {
          const horaFinFormato = this.minutosAHora(minutosFin).split(':').slice(0, 2).join(':')
          return {
            disponible: false,
            mensaje: `El evento terminaría a las ${horaFinFormato} (día siguiente), pero el club cierra a las ${horario.horaFin}`,
          }
        }
      }

      if (!horarioPasaMedianoche && eventoFinalPasaMedianoche) {
        return {
          disponible: false,
          mensaje: `El evento pasa de medianoche pero el horario del club no. Esto no está permitido.`,
        }
      }

      // 5. Validar bloqueos existentes (AQUÍ SÍ se considera montaje/desmontaje)
      const bloqueos = await BloqueoCalendario.query()
        .where('espacio_id', espacioId)
        .where('fecha', fecha)

      if (bloqueos.length > 0) {
        // Calcular tiempos con montaje/desmontaje solo para validar cruces
        const minutosInicioConMontaje = minutosInicio - (tiempoMontaje * 60)
        const minutosFinConDesmontaje = minutosFin + (tiempoDesmontaje * 60)

        console.log('🔍 Validando bloqueos:', {
          eventoSolicitado: `${horaInicio} (${minutosFin - minutosInicio} min)`,
          eventoConMontajeDesmontaje: `${this.minutosAHora(minutosInicioConMontaje)} - ${this.minutosAHora(minutosFinConDesmontaje)}`,
          tiempoMontaje: `${tiempoMontaje}h`,
          tiempoDesmontaje: `${tiempoDesmontaje}h`,
          bloqueosEncontrados: bloqueos.length,
        })

        for (const bloqueo of bloqueos) {
          const minBloqueoInicio = this.horaAMinutos(bloqueo.horaInicio)
          const minBloqueoFin = this.horaAMinutos(bloqueo.horaFin)
          
          // El evento se cruza con el bloqueo si:
          // - El evento termina DESPUÉS de que empieza el bloqueo Y
          // - El evento empieza ANTES de que termine el bloqueo
          // PERMITIR eventos que terminan exactamente cuando empieza el bloqueo
          const seSuperpone = minutosFinConDesmontaje > minBloqueoInicio && minutosInicioConMontaje < minBloqueoFin
          
          console.log(`   Bloqueo ${bloqueo.horaInicio}-${bloqueo.horaFin}:`, {
            bloqueoMinutos: `${minBloqueoInicio}-${minBloqueoFin}`,
            eventoConDesmontajeTermina: minutosFinConDesmontaje,
            bloqueoEmpieza: minBloqueoInicio,
            terminaAntes: minutosFinConDesmontaje <= minBloqueoInicio,
            terminaDespues: minutosFinConDesmontaje > minBloqueoInicio,
            seSuperpone,
          })

          if (seSuperpone) {
            const horaBloqueadoDesde = this.minutosAHora(minBloqueoInicio).split(':').slice(0, 2).join(':')
            const horaBloqueadoHasta = this.minutosAHora(minBloqueoFin).split(':').slice(0, 2).join(':')
            return {
              disponible: false,
              mensaje: `Ese horario no está disponible (${horaBloqueadoDesde}-${horaBloqueadoHasta}): ${bloqueo.razon || 'El espacio está reservado'}. Recuerda que se requieren ${tiempoMontaje}h montaje y ${tiempoDesmontaje}h desmontaje`,
            }
          }
        }
        
        console.log('✅ No hay cruces con bloqueos existentes')
      }

      // Calcular hora de fin legible
      const horaFinFormato = this.minutosAHora(minutosFin).split(':').slice(0, 2).join(':')

      console.log('Disponibilidad validada exitosamente:', {
        disponible: true,
        horaInicio,
        horaFin: horaFinFormato,
      })
      
      return {
        disponible: true,
        mensaje: `Disponible de ${horaInicio} a ${horaFinFormato}${eventoFinalPasaMedianoche ? ' (día siguiente)' : ''}`,
        horaFin: horaFinFormato,
      }
    } catch (error) {
      console.error('Error en validarDisponibilidad:', error)
      return {
        disponible: false,
        mensaje: `Error al validar disponibilidad: ${error.message}`,
      }
    }
  }

  /**
   * Calcular detalles y total de cotización
   */
  static async calcularCotizacion(solicitud: SolicitudCotizacion): Promise<DetalleCotizacion[]> {
    const detalles: DetalleCotizacion[] = []

    console.log('💰 Calculando cotización con tipo de cliente:', solicitud.tipoCliente)

    // OPTIMIZADO: Obtener tarifa y tarifas adicionales en una sola query (if needed)
    const tarifa = await Tarifa.query()
      .where('configuracion_espacio_id', solicitud.configuracionEspacioId)
      .where('tipo_cliente', solicitud.tipoCliente)
      .first()

    if (!tarifa) {
      throw new Error('Tarifa no encontrada para esta configuración y tipo de cliente')
    }

    // Determinar precio base según duración
    let precioBase = 0
    let descripcionTarifa = ''
    
    if (solicitud.duracion <= 4 && tarifa.precio4Horas) {
      precioBase = parseFloat(tarifa.precio4Horas.toString())
      descripcionTarifa = '4h'
    } else if (solicitud.duracion <= 8 && tarifa.precio8Horas) {
      precioBase = parseFloat(tarifa.precio8Horas.toString())
      descripcionTarifa = '8h'
    } else if (tarifa.precio8Horas) {
      // Si es más de 8h, usa precio base de 8h
      precioBase = parseFloat(tarifa.precio8Horas.toString())
      descripcionTarifa = '8h base'
    }

    console.log('[CotizacionService] Cálculo precio base:', {
      duracion: solicitud.duracion,
      tarifa4h: tarifa.precio4Horas,
      tarifa8h: tarifa.precio8Horas,
      precioBaseSeleccionado: precioBase,
      descripcion: descripcionTarifa,
    })

    if (precioBase === 0) {
      throw new Error(`No se encontró tarifa válida para duración ${solicitud.duracion}h`)
    }

    detalles.push({
      servicio: `Alquiler de Salón (${solicitud.duracion}h)`,
      cantidad: 1,
      valorUnitario: precioBase,
      total: precioBase,
    })

    // Agregar horas adicionales si aplican
    let horasAdicionales = 0
    if (solicitud.duracion > 8) {
      horasAdicionales = solicitud.duracion - 8

      const tarifaHoraAdicional = await TarifaHoraAdicional.query()
        .where('configuracion_espacio_id', solicitud.configuracionEspacioId)
        .where('tipo_cliente', solicitud.tipoCliente)
        .where('base_horas', 8)
        .where('min_personas', '<=', solicitud.asistentes)
        .where((qb) => {
          qb.whereNull('max_personas').orWhere('max_personas', '>=', solicitud.asistentes)
        })
        .first()

      if (tarifaHoraAdicional) {
        const precioHoraAdicional = parseFloat(tarifaHoraAdicional.precio.toString())
        detalles.push({
          servicio: 'Horas adicionales',
          cantidad: horasAdicionales,
          valorUnitario: precioHoraAdicional,
          total: precioHoraAdicional * horasAdicionales,
        })
      }
    }

    // Aplicar recargo nocturno si aplica
    const minutosInicio = this.horaAMinutos(solicitud.horaInicio)
    let minutosFin = minutosInicio + solicitud.duracion * 60
    const minutosHora22 = 22 * 60
    const aplicaRecargoNocturno = minutosFin > minutosHora22 || minutosFin >= 1440

    if (aplicaRecargoNocturno) {
      const subtotal = detalles.reduce((sum, d) => sum + d.total, 0)
      const valorRecargo = subtotal * 0.15 // 15% recargo

      detalles.push({
        servicio: 'Recargo nocturno (después de 22:00)',
        cantidad: 1,
        valorUnitario: valorRecargo,
        total: valorRecargo,
      })
    }

    // Agregar servicios adicionales (OPTIMIZADO: una sola query)
    if (solicitud.servicios && solicitud.servicios.length > 0) {
      const servicios = await ServicioAdicional.query()
        .where('tipo_cliente', solicitud.tipoCliente)
        .whereIn('id', solicitud.servicios)
        .where('activo', true)

      for (const servicio of servicios) {
        const precio = parseFloat(servicio.precio.toString())
        detalles.push({
          servicio: servicio.nombre,
          cantidad: 1,
          valorUnitario: precio,
          total: precio,
        })
      }
    }

    return detalles
  }

  /**
   * Recalcular cotización sin crear nueva (para actualizaciones)
   */
  static async recalcularCotizacion(solicitud: SolicitudCotizacion): Promise<{
    detalles: DetalleCotizacion[]
    valorTotal: number
    disposicionId: number | null
    horasAdicionalesAplicadas: number
    recargoNocturnoAplicado: boolean
    disponible: boolean
    mensajeDisponibilidad: string
  }> {
    // Validar disponibilidad
    const validacion = await this.validarDisponibilidad(
      solicitud.espacioId,
      solicitud.fecha,
      solicitud.horaInicio,
      solicitud.duracion,
      solicitud.tipoEvento
    )

    if (!validacion.disponible) {
      return {
        detalles: [],
        valorTotal: 0,
        disposicionId: null,
        horasAdicionalesAplicadas: 0,
        recargoNocturnoAplicado: false,
        disponible: false,
        mensajeDisponibilidad: validacion.mensaje,
      }
    }

    // Calcular detalles
    const detalles = await this.calcularCotizacion(solicitud)
    const valorTotal = detalles.reduce((sum, d) => sum + d.total, 0)

    // Determinar si aplica recargo nocturno
    const minutosInicio = this.horaAMinutos(solicitud.horaInicio)
    const minutosFin = minutosInicio + solicitud.duracion * 60
    const minutosHora22 = 22 * 60
    const recargoNocturnoAplicado = minutosFin > minutosHora22 || minutosFin >= 1440

    // Obtener disposicionId
    let disposicionId: number | null = null
    try {
      const config = await ConfiguracionEspacio.find(solicitud.configuracionEspacioId)
      if (config) {
        disposicionId = config.disposicionId
      }
    } catch (error) {
      console.warn('No se pudo obtener ConfiguracionEspacio:', error)
    }

    return {
      detalles,
      valorTotal,
      disposicionId,
      horasAdicionalesAplicadas: 0,
      recargoNocturnoAplicado,
      disponible: true,
      mensajeDisponibilidad: validacion.mensaje,
    }
  }

  /**
   * Crear cotización completa
   */
  static async crearCotizacion(solicitud: SolicitudCotizacion): Promise<ResultadoCotizacion> {
    console.log('=== CREAR COTIZACIÓN ===', solicitud)
    
    // Validar disponibilidad
    const validacion = await this.validarDisponibilidad(
      solicitud.espacioId,
      solicitud.fecha,
      solicitud.horaInicio,
      solicitud.duracion,
      solicitud.tipoEvento
    )
    
    console.log('Validación disponibilidad:', validacion)

    // Si no hay disponibilidad, crear cotización pero sin calcular detalles
    if (!validacion.disponible) {
      const cotizacionNumero = await Cotizacion.generarNumero()
      
      // Obtener disposicionId de ConfiguracionEspacio
      let disposicionId: number | null = null
      try {
        const config = await ConfiguracionEspacio.find(solicitud.configuracionEspacioId)
        if (config) {
          disposicionId = config.disposicionId
        }
      } catch (error) {
        console.warn('No se pudo obtener ConfiguracionEspacio:', error)
      }
      
      const cotizacion = await Cotizacion.create({
        espacioId: solicitud.espacioId,
        configuracionEspacioId: solicitud.configuracionEspacioId,
        disposicionId,
        fecha: solicitud.fecha,
        hora: solicitud.horaInicio,
        duracion: solicitud.duracion,
        asistentes: solicitud.asistentes,
        prestaciones: solicitud.servicios || [],
        requiereSillas: false,
        numeroSillas: 0,
        nombre: solicitud.nombre,
        email: solicitud.email,
        telefono: solicitud.telefono || null,
        observaciones: solicitud.observaciones || null,
        cotizacionNumero,
        valorTotal: 0,
        detalles: [],
        tipoEvento: solicitud.tipoEvento,
        tipoCliente: solicitud.tipoCliente,
        codigoSocio: solicitud.codigoSocio || null,
        estado: 'pendiente',
        estadoPago: 'sin_pagar',
        horasAdicionalesAplicadas: 0,
        recargoNocturnoAplicado: false,
        montoAbono: 0,
      })

      return {
        cotizacion,
        detalles: [],
        montoAbono: 0,
        disponible: false,
        mensajeDisponibilidad: validacion.mensaje,
      }
    }

    // Calcular detalles
    const detalles = await this.calcularCotizacion(solicitud)
    console.log('Detalles calculados:', detalles)
    
    const valorTotal = detalles.reduce((sum, d) => sum + d.total, 0)
    console.log('Valor Total calculado:', valorTotal)

    // Determinar si aplica recargo nocturno
    const minutosInicio = this.horaAMinutos(solicitud.horaInicio)
    const minutosFin = minutosInicio + solicitud.duracion * 60
    const minutosHora22 = 22 * 60
    const recargoNocturnoAplicado = minutosFin > minutosHora22 || minutosFin >= 1440

    // Generar número
    const cotizacionNumero = await Cotizacion.generarNumero()

    // Crear cotización
    // Obtener disposicionId de ConfiguracionEspacio
    let disposicionId: number | null = null
    try {
      const config = await ConfiguracionEspacio.find(solicitud.configuracionEspacioId)
      if (config) {
        disposicionId = config.disposicionId
      }
    } catch (error) {
      console.warn('No se pudo obtener ConfiguracionEspacio:', error)
    }
    
    const cotizacion = await Cotizacion.create({
      espacioId: solicitud.espacioId,
      configuracionEspacioId: solicitud.configuracionEspacioId,
      disposicionId,
      fecha: solicitud.fecha,
      hora: solicitud.horaInicio,
      duracion: solicitud.duracion,
      asistentes: solicitud.asistentes,
      prestaciones: solicitud.servicios || [],
      requiereSillas: false,
      numeroSillas: 0,
      nombre: solicitud.nombre,
      email: solicitud.email,
      telefono: solicitud.telefono || null,
      observaciones: solicitud.observaciones || null,
      cotizacionNumero,
      valorTotal,
      detalles,
      tipoEvento: solicitud.tipoEvento,
      tipoCliente: solicitud.tipoCliente,
      codigoSocio: solicitud.codigoSocio || null,
      estado: 'pendiente',
      estadoPago: 'sin_pagar',
      horasAdicionalesAplicadas: solicitud.duracion > 8 ? solicitud.duracion - 8 : 0,
      recargoNocturnoAplicado,
      montoAbono: Math.round(valorTotal * 0.5),
    })

    return {
      cotizacion,
      detalles,
      montoAbono: cotizacion.calcularMontoAbono(),
      disponible: true,
      mensajeDisponibilidad: validacion.mensaje,
    }
  }

  /**
   * Confirmar cotización y bloquear fecha
   */
  static async confirmarCotizacion(cotizacionId: number): Promise<void> {
    const cotizacion = await Cotizacion.findOrFail(cotizacionId)

    // Obtener tiempos de montaje/desmontaje del espacio
    const espacio = await Espacio.findOrFail(cotizacion.espacioId!)
    const tiempoMontaje = espacio.tiempoMontajeHoras || 2
    const tiempoDesmontaje = espacio.tiempoDesmontajeHoras || 2

    // Calcular hora de inicio con montaje y hora de fin con desmontaje
    const minutosInicio = this.horaAMinutos(cotizacion.hora)
    const minutosInicioConMontaje = minutosInicio - (tiempoMontaje * 60)
    const minutosFin = minutosInicio + (cotizacion.duracion * 60)
    const minutosFinConDesmontaje = minutosFin + (tiempoDesmontaje * 60)

    const horaInicioBloqueo = this.minutosAHora(minutosInicioConMontaje)
    const horaFinBloqueo = this.minutosAHora(minutosFinConDesmontaje)

    // Actualizar estado
    cotizacion.estado = 'aceptada'
    cotizacion.fechaConfirmacion = DateTime.now()
    cotizacion.estadoPago = 'abono_pendiente'
    await cotizacion.save()

    // Bloquear fecha en calendario con tiempos de montaje/desmontaje
    await BloqueoCalendario.create({
      espacioId: cotizacion.espacioId!,
      cotizacionId: cotizacion.id,
      fecha: cotizacion.fecha,
      horaInicio: horaInicioBloqueo,
      horaFin: horaFinBloqueo,
      razon: `Evento: ${cotizacion.nombre} (${cotizacion.hora}-${this.calcularHoraFin(cotizacion.hora, cotizacion.duracion).split(':').slice(0, 2).join(':')} + ${tiempoMontaje}h montaje + ${tiempoDesmontaje}h desmontaje)`,
      tipoBloqueo: 'reserva_confirmada',
    })
  }

  /**
   * Cancelar automáticamente cotizaciones que se crucen con una reserva confirmada
   */
  static async cancelarCotizacionesCruzadas(
    espacioId: number,
    fecha: string,
    horaInicio: string,
    duracion: number,
    cotizacionIdExcluir: number
  ): Promise<number> {
    const horaFin = this.calcularHoraFin(horaInicio, duracion)

    // Buscar cotizaciones pendientes que se crucen
    const cotizacionesConflictivas = await Cotizacion.query()
      .where('espacio_id', espacioId)
      .where('fecha', fecha)
      .where('estado', 'pendiente')
      .where('id', '!=', cotizacionIdExcluir)
      .preload('espacio')

    const cotizacionesACancelar: Cotizacion[] = []
    const horaInicioMinutos = this.horaAMinutos(horaInicio)
    const horaFinMinutos = this.horaAMinutos(horaFin)

    // Identificar cotizaciones con cruce de horario
    for (const cotizacion of cotizacionesConflictivas) {
      const cotizHoraFin = this.calcularHoraFin(cotizacion.hora, cotizacion.duracion)
      const cotizHoraInicioMinutos = this.horaAMinutos(cotizacion.hora)
      const cotizHoraFinMinutos = this.horaAMinutos(cotizHoraFin)

      const hayCruce =
        (cotizHoraInicioMinutos >= horaInicioMinutos && cotizHoraInicioMinutos < horaFinMinutos) ||
        (cotizHoraFinMinutos > horaInicioMinutos && cotizHoraFinMinutos <= horaFinMinutos) ||
        (cotizHoraInicioMinutos <= horaInicioMinutos && cotizHoraFinMinutos >= horaFinMinutos)

      if (hayCruce) {
        cotizacion.estado = 'rechazada'
        cotizacion.observaciones = cotizacion.observaciones
          ? `${cotizacion.observaciones}\n\n[SISTEMA] Cancelada automáticamente por conflicto con reserva confirmada #${cotizacionIdExcluir}`
          : `[SISTEMA] Cancelada automáticamente por conflicto con reserva confirmada #${cotizacionIdExcluir}`
        await cotizacion.save()
        cotizacionesACancelar.push(cotizacion)
      }
    }

    // Enviar emails en batch si hay cancelaciones
    if (cotizacionesACancelar.length > 0) {
      const { EmailService } = await import('#services/email_service')
      await EmailService.enviarNotificacionesCancelacionBatch(
        cotizacionesACancelar.map((cotizacion) => ({
          nombreCliente: cotizacion.nombre,
          emailCliente: cotizacion.email,
          cotizacionId: cotizacion.id,
          salon: cotizacion.espacio?.nombre || 'N/A',
          fecha: cotizacion.fecha,
          hora: cotizacion.hora,
          motivo:
            'Otra reserva fue confirmada para el mismo horario antes que la suya. Le invitamos a realizar una nueva cotización para una fecha u horario diferente.',
          tipoRechazo: 'automatico' as const,
        }))
      ).catch((error) => {
        console.error('Error enviando batch de emails de cancelación:', error)
      })
    }

    return cotizacionesACancelar.length
  }

  /**
   * Calcular hora de finalización
   */
  private static calcularHoraFin(horaInicio: string, duracion: number): string {
    const minutosInicio = this.horaAMinutos(horaInicio)
    const minutosFin = minutosInicio + duracion * 60

    // Si pasa de 1440 minutos (medianoche), restar 1440
    const minutosFinAjustado = minutosFin >= 1440 ? minutosFin - 1440 : minutosFin

    return this.minutosAHora(minutosFinAjustado)
  }
}
