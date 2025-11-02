import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ConfiguracionEspacio from '#models/configuracion_espacio'

export default class Espacio extends BaseModel {
  public static table = 'espacios'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column()
  declare activo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => ConfiguracionEspacio, {
    foreignKey: 'espacioId',
  })
  declare configuraciones: HasMany<typeof ConfiguracionEspacio>
}
