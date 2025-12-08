import type { HttpContext } from '@adonisjs/core/http'
import HorarioOperacion from '#models/horario_operacion'
import BloqueoCalendario from '#models/bloqueo_calendario'
import Espacio from '#models/espacio'
import { DateTime } from 'luxon'

export default class DisponibilidadController {
  /**
   * Obtener horas disponibles para un espacio en una fecha específica
   * GET /api/disponibilidad/horas?espacioId=1&fecha=2025-12-15
   */
  async obtenerHorasDisponibles({ request, response }: HttpContext) {
    try {
      const { espacioId, fecha, duracion } = request.qs()

      if (!espacioId || !fecha) {
        return response.status(400).json({
          success: false,
          message: 'Parámetros requeridos: espacioId, fecha',
        })
      }

      // Duración mínima por defecto es 4 horas
      const duracionHoras = duracion ? parseInt(duracion) : 4

      // Obtener configuración de montaje/desmontaje del espacio
      const espacio = await Espacio.find(espacioId)
      if (!espacio) {
        return response.status(404).json({
          success: false,
          message: 'Espacio no encontrado',
        })
      }

      const tiempoMontaje = espacio.tiempoMontajeHoras ?? 2
      const tiempoDesmontaje = espacio.tiempoDesmontajeHoras ?? 0

      console.log('Configuración espacio:', {
        espacioId,
        tiempoMontaje,
        tiempoDesmontaje,
        tiempoMontajeDB: espacio.tiempoMontajeHoras,
        tiempoDesmontajeDB: espacio.tiempoDesmontajeHoras,
        duracionEvento: duracionHoras,
      })

      // Validar formato de fecha
      const fechaObj = DateTime.fromISO(fecha, { zone: 'America/Bogota' })
      if (!fechaObj.isValid) {
        return response.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD',
        })
      }

      // Obtener día de la semana (0 = domingo, 6 = sábado)
      const diaSemana = fechaObj.weekday === 7 ? 0 : fechaObj.weekday

      // Obtener horario de operación para ese día
      const horario = await HorarioOperacion.query()
        .where('dia_semana', diaSemana)
        .where('esta_activo', true)
        .first()

      if (!horario) {
        return response.json({
          success: true,
          data: {
            fecha,
            horasDisponibles: [],
            mensaje: 'El club no opera este día de la semana',
          },
        })
      }

      // Generar slots de 1 hora desde hora_inicio hasta hora_fin
      let horaInicio = DateTime.fromFormat(horario.horaInicio, 'HH:mm:ss', {
        zone: 'America/Bogota',
      })
      let horaFin = DateTime.fromFormat(horario.horaFin, 'HH:mm:ss', {
        zone: 'America/Bogota',
      })

      // Si hora_fin es menor que hora_inicio, significa que cruza medianoche
      if (horaFin.hour < horaInicio.hour) {
        horaFin = horaFin.plus({ days: 1 })
      }

      // Calcular la última hora válida de inicio basada en la duración del evento
      // Si cierra a 22:00 y el evento dura 4h, última hora de inicio = 18:00
      const ultimaHoraInicio = horaFin.minus({ hours: duracionHoras })

      console.log('Cálculo de horarios:', {
        horaInicioOperacion: horaInicio.toFormat('HH:mm'),
        horaFinOperacion: horaFin.toFormat('HH:mm'),
        duracionEvento: duracionHoras,
        ultimaHoraInicioEvento: ultimaHoraInicio.toFormat('HH:mm'),
      })

      const slots: { hora: string; disponible: boolean }[] = []
      let horaActual = horaInicio

      // Generar slots cada hora desde la apertura hasta la última hora válida
      while (horaActual <= ultimaHoraInicio) {
        const horaStr = horaActual.toFormat('HH:mm')
        slots.push({
          hora: horaStr,
          disponible: true,
        })
        horaActual = horaActual.plus({ hours: 1 })
      }

      console.log(`🕐 Slots generados inicialmente: ${slots.length}`, slots.map(s => s.hora))

      // Obtener bloqueos para esta fecha y espacio
      const bloqueos = await BloqueoCalendario.query()
        .where('espacio_id', espacioId)
        .where('fecha', fecha)

      console.log(`🚫 Bloqueos encontrados: ${bloqueos.length}`, bloqueos.map(b => `${b.horaInicio}-${b.horaFin}`))

      // Marcar slots como no disponibles si hay bloqueos
      for (const bloqueo of bloqueos) {
        const bloqueadoInicio = DateTime.fromFormat(bloqueo.horaInicio, 'HH:mm:ss', {
          zone: 'America/Bogota',
        })
        const bloqueadoFin = DateTime.fromFormat(bloqueo.horaFin, 'HH:mm:ss', {
          zone: 'America/Bogota',
        })

        console.log('Verificando bloqueo:', {
          desde: bloqueadoInicio.toFormat('HH:mm'),
          hasta: bloqueadoFin.toFormat('HH:mm'),
          razon: bloqueo.razon,
        })

        for (const slot of slots) {
          const slotHora = DateTime.fromFormat(slot.hora, 'HH:mm', {
            zone: 'America/Bogota',
          })

          // Calcular el rango total del evento con montaje/desmontaje
          const eventoInicioConMontaje = slotHora.minus({ hours: tiempoMontaje })
          const eventoFinConDesmontaje = slotHora.plus({
            hours: duracionHoras + tiempoDesmontaje,
          })

          // Convertir a minutos desde medianoche para comparación precisa
          const eventoFinMinutos = eventoFinConDesmontaje.hour * 60 + eventoFinConDesmontaje.minute
          const eventoInicioMinutos = eventoInicioConMontaje.hour * 60 + eventoInicioConMontaje.minute
          const bloqueadoInicioMinutos = bloqueadoInicio.hour * 60 + bloqueadoInicio.minute
          const bloqueadoFinMinutos = bloqueadoFin.hour * 60 + bloqueadoFin.minute

          // El evento se cruza con el bloqueo si:
          // - El evento termina DESPUÉS de que empieza el bloqueo Y
          // - El evento empieza ANTES de que termine el bloqueo
          // PERMITIR eventos que terminan exactamente cuando empieza el bloqueo (<=)
          const seCruza = eventoFinMinutos > bloqueadoInicioMinutos && eventoInicioMinutos < bloqueadoFinMinutos

          if (seCruza) {
            slot.disponible = false
            console.log(
              `❌ Slot ${slot.hora} bloqueado:`,
              {
                eventoInicio: slotHora.toFormat('HH:mm'),
                eventoFin: slotHora.plus({ hours: duracionHoras }).toFormat('HH:mm'),
                conMontaje: eventoInicioConMontaje.toFormat('HH:mm'),
                conDesmontaje: eventoFinConDesmontaje.toFormat('HH:mm'),
                bloqueadoDesde: bloqueadoInicio.toFormat('HH:mm'),
                bloqueadoHasta: bloqueadoFin.toFormat('HH:mm'),
                eventoFinMinutos,
                bloqueadoInicioMinutos,
                terminaAntes: eventoFinMinutos < bloqueadoInicioMinutos,
                cruza: seCruza,
              }
            )
          } else {
            console.log(
              `✅ Slot ${slot.hora} disponible:`,
              {
                eventoInicio: slotHora.toFormat('HH:mm'),
                eventoFin: slotHora.plus({ hours: duracionHoras }).toFormat('HH:mm'),
                conDesmontaje: eventoFinConDesmontaje.toFormat('HH:mm'),
                bloqueadoDesde: bloqueadoInicio.toFormat('HH:mm'),
                eventoFinMinutos,
                bloqueadoInicioMinutos,
                terminaAntes: eventoFinMinutos < bloqueadoInicioMinutos,
              }
            )
          }
        }
      }

      // DEBUG: Mostrar estado de TODOS los slots antes de filtrar
      console.log('📊 Estado de todos los slots generados:')
      slots.forEach(slot => {
        console.log(`   ${slot.disponible ? '✅' : '❌'} ${slot.hora}`)
      })

      // Filtrar solo slots disponibles
      const horasDisponibles = slots.filter((s) => s.disponible).map((s) => s.hora)

      console.log('Resultado final:', {
        totalSlots: slots.length,
        slotsDisponibles: horasDisponibles.length,
        horasDisponibles,
        todosLosSlots: slots,
      })

      return response.json({
        success: true,
        data: {
          fecha,
          espacioId: parseInt(espacioId),
          horarioOperacion: {
            horaInicio: horario.horaInicio.substring(0, 5),
            horaFin: horario.horaFin.substring(0, 5),
            diaSemana: horario.nombreDia,
          },
          horasDisponibles,
          totalSlots: slots.length,
          slotsDisponibles: horasDisponibles.length,
        },
      })
    } catch (error) {
      console.error('Error obteniendo horas disponibles:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener horas disponibles',
        error: error.message,
      })
    }
  }
}
