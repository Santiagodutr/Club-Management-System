import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class EspaciosSeeder extends BaseSeeder {
  public static environment = ['development', 'production', 'test']

  public async run() {
    const rows = [
        { id: 1, nombre: 'MI LLANURA', descripcion: null, activo: true, created_at: '2025-11-02 16:25:52+00', updated_at: '2025-11-02 16:25:53+00' },
        { id: 2, nombre: 'BAR', descripcion: null, activo: true, created_at: '2025-11-02 16:26:08+00', updated_at: '2025-11-02 16:26:09+00' },
        { id: 3, nombre: 'EMPRESARIAL', descripcion: null, activo: true, created_at: '2025-11-02 16:26:23+00', updated_at: '2025-11-02 16:26:24+00' },
        { id: 4, nombre: 'TERRAZA', descripcion: null, activo: true, created_at: '2025-11-02 16:26:41+00', updated_at: '2025-11-02 16:26:42+00' },
        { id: 5, nombre: 'KIOSKO', descripcion: null, activo: true, created_at: '2025-11-02 16:27:02+00', updated_at: '2025-11-02 16:27:04+00' },
        { id: 6, nombre: 'PRESIDENTE', descripcion: null, activo: true, created_at: '2025-11-02 16:27:15+00', updated_at: '2025-11-02 16:27:17+00' },
      ]

    // Upsert por fila con ON CONFLICT
    for (const r of rows) {
      await db.raw(
        `INSERT INTO public.espacios (id, nombre, descripcion, activo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           descripcion = EXCLUDED.descripcion,
           activo = EXCLUDED.activo,
           created_at = EXCLUDED.created_at,
           updated_at = EXCLUDED.updated_at;`,
        [r.id, r.nombre, r.descripcion, r.activo, r.created_at, r.updated_at]
      )
    }

    // Nota: no eliminamos registros existentes; solo upsert
  }
}
