import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ConfiguracionEspacio from '#models/configuracion_espacio'

export default class Disposicion extends BaseModel {
  public static table = 'disposiciones'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => ConfiguracionEspacio, {
    foreignKey: 'disposicionId',
  })
  declare configuraciones: HasMany<typeof ConfiguracionEspacio>
}
