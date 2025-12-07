import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cotizaciones'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('codigo_socio', 50).nullable().comment('Código del socio usado al crear la cotización')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('codigo_socio')
    })
  }
}