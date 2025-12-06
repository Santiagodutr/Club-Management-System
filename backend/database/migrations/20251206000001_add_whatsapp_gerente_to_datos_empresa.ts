import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'datos_empresa'

  async up() {
    // Verificar si la columna ya existe antes de agregarla
    const hasColumn = await this.raw(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='datos_empresa' 
       AND column_name='whatsapp_gerente'`
    )

    if (hasColumn.rows.length === 0) {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('whatsapp_gerente', 20).nullable()
      })
    }
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('whatsapp_gerente')
    })
  }
}
