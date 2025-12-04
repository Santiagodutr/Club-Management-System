import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Espacio from '#models/espacio'
import ConfiguracionEspacio from '#models/configuracion_espacio'
import Disposicion from '#models/disposicion'

export interface DetalleCotizacion {
  servicio: string
  cantidad: number
  valorUnitario: number
  total: number
}

export default class Cotizacion extends BaseModel {
  public static table = 'cotizaciones'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fecha: string // YYYY-MM-DD

  @column()
  declare hora: string // HH:mm

  @column()
  declare duracion: number // en horas

  @column()
  declare asistentes: number

  @column({
    consume: (value) => (value ? (typeof value === 'string' ? JSON.parse(value) : value) : []),
    prepare: (value) => (value ? JSON.stringify(value) : JSON.stringify([])),
  })
  declare prestaciones: string[] | number[]

  @column({ columnName: 'requiere_sillas' })
  declare requiereSillas: boolean

  @column({ columnName: 'numero_sillas' })
  declare numeroSillas: number

  @column()
  declare nombre: string

  @column()
  declare email: string

  @column()
  declare telefono: string | null

  @column()
  declare observaciones: string | null

  @column({ columnName: 'cotizacion_numero' })
  declare cotizacionNumero: string

  @column({ columnName: 'valor_total' })
  declare valorTotal: number | string

  @column({
    consume: (value) => (value ? (typeof value === 'string' ? JSON.parse(value) : value) : []),
    prepare: (value) => (value ? JSON.stringify(value) : JSON.stringify([])),
  })
  declare detalles: string | DetalleCotizacion[]

  @column({ columnName: 'tipo_evento' })
  declare tipoEvento: string | null // 'social', 'empresarial', 'capacitacion'

  @column()
  declare estado: string // 'pendiente', 'aceptada', 'rechazada', 'vencida'

  @column({ columnName: 'usuario_id' })
  declare usuarioId: string | null

  @column({ columnName: 'estado_pago' })
  declare estadoPago: string // 'sin_pagar', 'abono_pendiente', 'abonado', 'pagado'

  @column({ columnName: 'fecha_confirmacion' })
  declare fechaConfirmacion: DateTime | null

  @column({ columnName: 'horas_adicionales_aplicadas' })
  declare horasAdicionalesAplicadas: number

  @column({ columnName: 'recargo_nocturno_aplicado' })
  declare recargoNocturnoAplicado: boolean

  @column({ columnName: 'monto_abono' })
  declare montoAbono: number | string | null

  @column({ columnName: 'monto_pagado' })
  declare montoPagado: number | string

  @column({ columnName: 'espacio_id' })
  declare espacioId: number | null

  @column({ columnName: 'configuracion_espacio_id' })
  declare configuracionEspacioId: number | null

  @column({ columnName: 'disposicion_id' })
  declare disposicionId: number | null

  @column({ columnName: 'montaje_tiempo_horas' })
  declare montajeTiempoHoras: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Espacio, {
    foreignKey: 'espacioId',
  })
  declare espacio: BelongsTo<typeof Espacio>

  @belongsTo(() => ConfiguracionEspacio, {
    foreignKey: 'configuracionEspacioId',
  })
  declare configuracion: BelongsTo<typeof ConfiguracionEspacio>

  @belongsTo(() => Disposicion, {
    foreignKey: 'disposicionId',
  })
  declare disposicion: BelongsTo<typeof Disposicion>

  /**
   * Generar número de cotización con formato: AAAA-MM-NUMERO
   * Optimizado: Usa raw query para evitar N+1 queries
   */
  static async generarNumero(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // Obtener solo el número más reciente del mes actual
    const result = await this.query()
      .select('cotizacion_numero')
      .where('cotizacion_numero', 'like', `${year}-${month}-%`)
      .orderBy('id', 'desc')
      .limit(1)
      .first()

    const numero = result ? parseInt(result.cotizacionNumero.split('-')[2]) + 1 : 1
    const numeroFormato = String(numero).padStart(4, '0')

    return `${year}-${month}-${numeroFormato}`
  }

  /**
   * Convertir detalles JSON a objeto
   */
  getDetalles(): DetalleCotizacion[] {
    return typeof this.detalles === 'string' ? JSON.parse(this.detalles) : this.detalles
  }

  /**
   * Calcular monto del abono (50%)
   */
  calcularMontoAbono(): number {
    const total = typeof this.valorTotal === 'string' 
      ? parseFloat(this.valorTotal) 
      : this.valorTotal
    return Math.round(total * 0.5)
  }

  /**
   * Obtener estado legible
   */
  get estadoLegible(): string {
    const estados: Record<string, string> = {
      pendiente: 'Pendiente de aprobación',
      aceptada: 'Aceptada',
      rechazada: 'Rechazada',
      vencida: 'Vencida',
    }
    return estados[this.estado] || this.estado
  }

  /**
   * Obtener estado de pago legible
   */
  get estadoPagoLegible(): string {
    const estados: Record<string, string> = {
      sin_pagar: 'Sin pagar',
      abono_pendiente: 'Abono pendiente',
      abonado: 'Abonado',
      pagado: 'Pagado completamente',
    }
    return estados[this.estadoPago] || this.estadoPago
  }
}
