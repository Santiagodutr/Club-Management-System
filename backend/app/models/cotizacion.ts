import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cotizacion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare salon: string

  @column()
  declare fecha: string

  @column()
  declare hora: string

  @column()
  declare duracion: number

  @column()
  declare asistentes: number

  @column()
  declare prestaciones: string // JSON string array

  @column()
  declare requiereSillas: boolean

  @column()
  declare numeroSillas: number

  @column()
  declare nombre: string

  @column()
  declare email: string

  @column()
  declare telefono: string | null

  @column()
  declare observaciones: string | null

  @column()
  declare cotizacionNumero: string // Ej: "0926"

  @column()
  declare valorTotal: number

  @column()
  declare detalles: string // JSON string con items detallados

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
