import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateTarifasTable extends BaseSchema {
  protected tableName = 'tarifas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('configuracion_espacio_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('configuraciones_espacio')
        .onDelete('CASCADE')

      table
        .enum('tipo_cliente', ['socio', 'particular'], {
          useNative: true,
          enumName: 'tipo_cliente',
        })
        .notNullable()

      table.decimal('precio_4_horas', 12, 2).nullable()
      table.decimal('precio_8_horas', 12, 2).nullable()
      table.boolean('cortesia').notNullable().defaultTo(false)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    // Drop enum type on Postgres if it exists
    this.schema.raw(
      'DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = "tipo_cliente") THEN DROP TYPE "tipo_cliente"; END IF; END $$;'
    )
  }
}
