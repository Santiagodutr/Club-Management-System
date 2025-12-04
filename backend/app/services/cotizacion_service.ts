import { DateTime } from 'luxon'
import Cotizacion, { DetalleCotizacion } from '#models/cotizacion'
import HorarioOperacion from '#models/horario_operacion'
import BloqueoCalendario from '#models/bloqueo_calendario'
import ServicioAdicional from '#models/servicio_adicional'
import Tarifa from '#models/tarifa'
import TarifaHoraAdicional from '#models/tarifa_hora_adicional'
import ConfiguracionEspacio from '#models/configuracion_espacio'

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

      // 3. Validar horarios operativos
      if (minutosInicio < minutosOpInicio) {
        return {
          disponible: false,
          mensaje: `El evento no puede empezar a las ${horaInicio}, el club abre a las ${horario.horaInicio}`,
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

      // 4. Validar hora de fin
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
        if (diaSemana !== 5 && diaSemana !== 6) {
          const horaFinFormato = this.minutosAHora(minutosFin).split(':').slice(0, 2).join(':')
          return {
            disponible: false,
            mensaje: `Solo se permiten eventos que pasen medianoche viernes y sábados. Tu evento terminaría a las ${horaFinFormato} del día siguiente`,
          }
        }
      }

      // 5. Validar tiempo de montaje para empresariales
      if (tipoEvento === 'empresarial') {
        const minutosMontajeInicio = minutosInicio - 120
        if (minutosMontajeInicio < 0 || minutosMontajeInicio < minutosOpInicio) {
          const horaParaMontaje = this.minutosAHora(minutosOpInicio + 120).split(':').slice(0, 2).join(':')
          return {
            disponible: false,
            mensaje: `Para eventos empresariales necesitamos 2 horas de montaje. Puedes empezar desde las ${horaParaMontaje}`,
          }
        }
      }

      // 6. Validar bloqueos (OPTIMIZADO: una sola query)
      const bloqueos = await BloqueoCalendario.query()
        .where('espacio_id', espacioId)
        .where('fecha', fecha)

      if (bloqueos.length > 0) {
        for (const bloqueo of bloqueos) {
          const minBloqueoInicio = this.horaAMinutos(bloqueo.horaInicio)
          const minBloqueoFin = this.horaAMinutos(bloqueo.horaFin)
          const seSuperpone = !(minutosFin <= minBloqueoInicio || minutosInicio >= minBloqueoFin)
          if (seSuperpone) {
            return {
              disponible: false,
              mensaje: `Ese horario no está disponible: ${bloqueo.razon || 'El espacio está reservado'}`,
            }
          }
        }
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
    if (solicitud.duracion <= 4 && tarifa.precio4Horas) {
      precioBase = parseFloat(tarifa.precio4Horas.toString())
    } else if (solicitud.duracion <= 8 && tarifa.precio8Horas) {
      precioBase = parseFloat(tarifa.precio8Horas.toString())
    } else if (tarifa.precio8Horas) {
      precioBase = parseFloat(tarifa.precio8Horas.toString())
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

    // Actualizar estado
    cotizacion.estado = 'aceptada'
    cotizacion.fechaConfirmacion = DateTime.now()
    cotizacion.estadoPago = 'abono_pendiente'
    await cotizacion.save()

    // Bloquear fecha en calendario
    await BloqueoCalendario.create({
      espacioId: cotizacion.espacioId!,
      fecha: cotizacion.fecha,
      horaInicio: cotizacion.hora,
      horaFin: this.calcularHoraFin(cotizacion.hora, cotizacion.duracion),
      razon: `Evento confirmado: ${cotizacion.nombre}`,
      tipoBloqueo: 'reserva_confirmada',
    })
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
