import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Socio extends BaseModel {
  public static table = 'socios'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare codigo: string

  @column()
  declare activo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Buscar socio por código
   */
  static async porCodigo(codigo: string) {
    return this.query().where('codigo', codigo).where('activo', true).first()
  }
}
