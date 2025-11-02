import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class DisposicionesSeeder extends BaseSeeder {
  public static environment = ['development', 'production', 'test']

  public async run() {
    const rows = [
      { id: 2, nombre: 'MESA EN U', created_at: '2025-11-02 16:23:56+00', updated_at: '2025-11-02 16:23:56+00' },
      { id: 3, nombre: 'AUDITORIO', created_at: '2025-11-02 16:24:15+00', updated_at: '2025-11-02 16:24:18+00' },
      { id: 4, nombre: 'ESCUELA', created_at: '2025-11-02 16:24:37+00', updated_at: '2025-11-02 16:24:38+00' },
      { id: 5, nombre: 'BANQUETE', created_at: '2025-11-02 16:24:47+00', updated_at: '2025-11-02 16:24:48+00' },
      { id: 7, nombre: 'IMPERIAL', created_at: '2025-11-02 16:25:04+00', updated_at: '2025-11-02 16:25:05+00' },
    ]

    for (const r of rows) {
      await db.raw(
        `INSERT INTO public.disposiciones (id, nombre, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           created_at = EXCLUDED.created_at,
           updated_at = EXCLUDED.updated_at;`,
        [r.id, r.nombre, r.created_at, r.updated_at]
      )
    }

    // Nota: no eliminamos registros existentes; solo upsert
  }
}
