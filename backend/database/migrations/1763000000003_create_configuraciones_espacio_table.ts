import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateConfiguracionesEspacioTable extends BaseSchema {
  protected tableName = 'configuraciones_espacio'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('espacio_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('espacios')
        .onDelete('CASCADE')
      table
        .integer('disposicion_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('disposiciones')
        .onDelete('CASCADE')
      table.integer('capacidad').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
