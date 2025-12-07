import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cotizaciones'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('tipo_cliente', ['socio', 'particular']).defaultTo('particular').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tipo_cliente')
    })
  }
}