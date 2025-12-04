import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cotizaciones'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('salon')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('salon', 255).nullable()
    })
  }
}
