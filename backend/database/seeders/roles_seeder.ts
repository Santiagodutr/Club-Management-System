import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class RolesSeeder extends BaseSeeder {
  public static environment = ['development', 'production', 'test']

  public async run() {
    await db.raw(
      `INSERT INTO roles (nombre, descripcion, created_at, updated_at) VALUES
        ('admin', 'Administrador del sistema', NOW(), NOW()),
        ('empleado', 'Empleado del club', NOW(), NOW()),
        ('socio', 'Miembro socio del club', NOW(), NOW()),
        ('particular', 'Cliente particular', NOW(), NOW());`
    )
  }
}
