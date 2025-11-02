import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateUsuariosTable extends BaseSchema {
  protected tableName = 'usuarios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id')
        .primary()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')

      table
        .integer('rol_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roles')
        .onDelete('RESTRICT')

      table.string('nombre_completo').nullable()
      table.string('telefono').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
