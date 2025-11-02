import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateTarifasHoraAdicionalTable extends BaseSchema {
  protected tableName = 'tarifas_hora_adicional'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('configuracion_espacio_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('configuraciones_espacio')
        .onDelete('CASCADE')

      // Reusar el tipo nativo "tipo_cliente" ya creado por la migración de tarifas
      table
        .enum('tipo_cliente', ['socio', 'particular'], {
          useNative: true,
          enumName: 'tipo_cliente',
          existingType: true,
        })
        .notNullable()

      // 4 u 8 horas como base
      table.smallint('base_horas').notNullable()
      table.check('base_horas IN (4, 8)')

      table.integer('min_personas').notNullable().defaultTo(0)
      table.integer('max_personas').nullable()

      table.decimal('precio', 12, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['configuracion_espacio_id', 'tipo_cliente', 'base_horas'], 'tarifa_hora_idx')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
