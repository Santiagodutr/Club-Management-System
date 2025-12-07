import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ConfiguracionEspacio from '#models/configuracion_espacio'

export default class ServicioAdicional extends BaseModel {
  public static table = 'servicios_adicionales'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column({ columnName: 'configuracion_espacio_id' })
  declare configuracionEspacioId: number | null

  @column({ columnName: 'tipo_cliente', serializeAs: 'tipo_cliente' })
  declare tipoCliente: string // 'socio' | 'particular'

  @column()
  declare precio: string | number

  @column()
  declare activo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ConfiguracionEspacio, {
    foreignKey: 'configuracionEspacioId',
  })
  declare configuracion: BelongsTo<typeof ConfiguracionEspacio>
}
