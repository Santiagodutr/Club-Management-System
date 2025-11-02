import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateDatosEmpresaTable extends BaseSchema {
  protected tableName = 'datos_empresa'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key').notNullable().defaultTo('empresa').primary()
      table.string('nit').notNullable().unique()
      table.string('bancolombia_cc').nullable()
      table.string('davivienda_cc').nullable()
      table.string('davivienda_ca').nullable()
      table.text('direccion').nullable()
      table.decimal('lat', 10, 7).nullable()
      table.decimal('lng', 10, 7).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.check("key = 'empresa'")
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
