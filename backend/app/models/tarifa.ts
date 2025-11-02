import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ConfiguracionEspacio from '#models/configuracion_espacio'
import { TipoCliente } from '../enums/tipo_cliente.js'

export default class Tarifa extends BaseModel {
  public static table = 'tarifas'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'configuracion_espacio_id' })
  declare configuracionEspacioId: number

  @column()
  declare tipoCliente: TipoCliente

  @column({ columnName: 'precio_4_horas' })
  declare precio4Horas: string | null

  @column({ columnName: 'precio_8_horas' })
  declare precio8Horas: string | null

  @column()
  declare cortesia: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ConfiguracionEspacio, {
    foreignKey: 'configuracionEspacioId',
  })
  declare configuracion: BelongsTo<typeof ConfiguracionEspacio>
}
