import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ConfiguracionEspacio from '#models/configuracion_espacio'

interface ImagenEspacio {
  url: string
  alt: string
  esPortada?: boolean
}

export default class Espacio extends BaseModel {
  public static table = 'espacios'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column({ columnName: 'slug' })
  declare slug: string | null

  @column({ columnName: 'subtitulo' })
  declare subtitulo: string | null

  @column({ columnName: 'descripcion_completa' })
  declare descripcionCompleta: string | null

  @column({ columnName: 'capacidad_minima' })
  declare capacidadMinima: number | null

  @column({ columnName: 'capacidad_maxima' })
  declare capacidadMaxima: number | null

  @column({ columnName: 'area_m2' })
  declare areaM2: number | null

  @column({ columnName: 'horario_disponible' })
  declare horarioDisponible: string | null

  @column({ columnName: 'precio_desde' })
  declare precioDesde: string | null

  @column({
    columnName: 'caracteristicas',
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    },
  })
  declare caracteristicas: string[] | null

  @column({
    columnName: 'servicios_incluidos',
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    },
  })
  declare serviciosIncluidos: string[] | null

  @column({
    columnName: 'imagenes',
    prepare: (value: ImagenEspacio[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    },
  })
  declare imagenes: ImagenEspacio[] | null

  @column({ columnName: 'destacado' })
  declare destacado: boolean

  @column({ columnName: 'activo' })
  declare activo: boolean

  @column({ columnName: 'tiempo_montaje_horas' })
  declare tiempoMontajeHoras: number

  @column({ columnName: 'tiempo_desmontaje_horas' })
  declare tiempoDesmontajeHoras: number

  @column.dateTime({ columnName: 'contenido_actualizado_at' })
  declare contenidoActualizadoAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => ConfiguracionEspacio, {
    foreignKey: 'espacioId',
  })
  declare configuraciones: HasMany<typeof ConfiguracionEspacio>
}
