import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cotizacion extends BaseModel {
  public static table = 'cotizaciones'

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
  declare valorTotal: number

  @column()
  declare detalles: string // JSON string con items detallados

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
