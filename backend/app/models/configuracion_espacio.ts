import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Espacio from '#models/espacio'
import Disposicion from '#models/disposicion'
import Tarifa from '#models/tarifa'
import TarifaHoraAdicional from '#models/tarifa_hora_adicional'

export default class ConfiguracionEspacio extends BaseModel {
  public static table = 'configuraciones_espacio'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'espacio_id' })
  declare espacioId: number

  @column({ columnName: 'disposicion_id' })
  declare disposicionId: number

  @column()
  declare capacidad: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Espacio, {
    foreignKey: 'espacioId',
  })
  declare espacio: BelongsTo<typeof Espacio>

  @belongsTo(() => Disposicion, {
    foreignKey: 'disposicionId',
  })
  declare disposicion: BelongsTo<typeof Disposicion>

  @hasMany(() => Tarifa, {
    foreignKey: 'configuracionEspacioId',
  })
  declare tarifas: HasMany<typeof Tarifa>

  @hasMany(() => TarifaHoraAdicional, {
    foreignKey: 'configuracionEspacioId',
  })
  declare tarifasHoraAdicional: HasMany<typeof TarifaHoraAdicional>
}
