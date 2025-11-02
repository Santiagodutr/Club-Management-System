import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Empresa extends BaseModel {
  public static table = 'empresas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare nit: string

  @column({ columnName: 'bancolombia_cc' })
  declare bancolombiaCc: string | null

  @column({ columnName: 'davivienda_cc' })
  declare daviviendaCc: string | null

  @column({ columnName: 'davivienda_ca' })
  declare daviviendaCa: string | null

  @column()
  declare direccion: string | null

  // Guardamos lat/lng como DECIMAL en la BD. En el modelo usamos string para evitar problemas de precisión.
  @column()
  declare lat: string | null

  @column()
  declare lng: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
