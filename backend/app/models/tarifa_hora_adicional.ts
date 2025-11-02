import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ConfiguracionEspacio from '#models/configuracion_espacio'
import { TipoCliente } from '../enums/tipo_cliente.js'

export default class TarifaHoraAdicional extends BaseModel {
  public static table = 'tarifas_hora_adicional'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'configuracion_espacio_id' })
  declare configuracionEspacioId: number

  @column({ columnName: 'tipo_cliente' })
  declare tipoCliente: TipoCliente

  // 4 u 8 horas como base de la reserva a la que aplica esta tarifa adicional
  @column({ columnName: 'base_horas' })
  declare baseHoras: number

  @column({ columnName: 'min_personas' })
  declare minPersonas: number

  @column({ columnName: 'max_personas' })
  declare maxPersonas: number | null

  @column()
  declare precio: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ConfiguracionEspacio, {
    foreignKey: 'configuracionEspacioId',
  })
  declare configuracion: BelongsTo<typeof ConfiguracionEspacio>
}
