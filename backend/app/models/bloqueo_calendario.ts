import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Espacio from '#models/espacio'

export default class BloqueoCalendario extends BaseModel {
  public static table = 'bloqueos_calendario'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'espacio_id' })
  declare espacioId: number

  @column({ columnName: 'cotizacion_id' })
  declare cotizacionId: number | null

  @column()
  declare fecha: string // YYYY-MM-DD

  @column({ columnName: 'hora_inicio' })
  declare horaInicio: string // HH:mm:ss

  @column({ columnName: 'hora_fin' })
  declare horaFin: string // HH:mm:ss

  @column()
  declare razon: string | null

  @column({ columnName: 'tipo_bloqueo' })
  declare tipoBloqueo: string // 'manual', 'mantenimiento', 'reserva_confirmada'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Espacio, {
    foreignKey: 'espacioId',
  })
  declare espacio: BelongsTo<typeof Espacio>
}
