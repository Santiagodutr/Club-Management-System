import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class ConfiguracionesEspacioSeeder extends BaseSeeder {
  public static environment = ['development', 'production', 'test']

  public async run() {
    const rows = [
      { id: 1, espacio_id: 1, disposicion_id: 2, capacidad: 60, created_at: '2025-11-02 16:28:06+00', updated_at: '2025-11-02 16:28:08+00' },
      { id: 2, espacio_id: 1, disposicion_id: 3, capacidad: 100, created_at: '2025-11-02 16:28:26+00', updated_at: '2025-11-02 16:28:28+00' },
      { id: 3, espacio_id: 1, disposicion_id: 4, capacidad: 100, created_at: '2025-11-02 16:28:45+00', updated_at: '2025-11-02 16:28:46+00' },
      { id: 4, espacio_id: 1, disposicion_id: 5, capacidad: 100, created_at: '2025-11-02 16:29:01+00', updated_at: '2025-11-02 16:29:02+00' },
      { id: 5, espacio_id: 2, disposicion_id: 7, capacidad: 30, created_at: '2025-11-02 16:30:00+00', updated_at: '2025-11-02 16:30:00+00' },
      { id: 6, espacio_id: 2, disposicion_id: 2, capacidad: 30, created_at: '2025-11-02 16:30:17+00', updated_at: '2025-11-02 16:30:19+00' },
      { id: 7, espacio_id: 2, disposicion_id: 4, capacidad: 30, created_at: '2025-11-02 16:30:35+00', updated_at: '2025-11-02 16:30:36+00' },
      { id: 8, espacio_id: 2, disposicion_id: 3, capacidad: 50, created_at: '2025-11-02 16:30:55+00', updated_at: '2025-11-02 16:30:56+00' },
      { id: 10, espacio_id: 2, disposicion_id: 5, capacidad: 60, created_at: '2025-11-02 16:31:21+00', updated_at: '2025-11-02 16:31:22+00' },
      { id: 11, espacio_id: 3, disposicion_id: 7, capacidad: 25, created_at: '2025-11-02 16:32:31+00', updated_at: '2025-11-02 16:32:33+00' },
      { id: 12, espacio_id: 3, disposicion_id: 2, capacidad: 25, created_at: '2025-11-02 16:33:01+00', updated_at: '2025-11-02 16:33:02+00' },
      { id: 13, espacio_id: 3, disposicion_id: 3, capacidad: 35, created_at: '2025-11-02 16:33:19+00', updated_at: '2025-11-02 16:33:20+00' },
      { id: 14, espacio_id: 4, disposicion_id: 7, capacidad: 20, created_at: '2025-11-02 16:33:42+00', updated_at: '2025-11-02 16:33:43+00' },
      { id: 15, espacio_id: 4, disposicion_id: 5, capacidad: 30, created_at: '2025-11-02 16:34:00+00', updated_at: '2025-11-02 16:34:01+00' },
      { id: 16, espacio_id: 5, disposicion_id: 7, capacidad: 30, created_at: '2025-11-02 16:34:23+00', updated_at: '2025-11-02 16:34:23+00' },
      { id: 17, espacio_id: 5, disposicion_id: 2, capacidad: 30, created_at: '2025-11-02 16:34:40+00', updated_at: '2025-11-02 16:34:41+00' },
      { id: 18, espacio_id: 5, disposicion_id: 4, capacidad: 30, created_at: '2025-11-02 16:34:54+00', updated_at: '2025-11-02 16:34:55+00' },
      { id: 19, espacio_id: 5, disposicion_id: 3, capacidad: 50, created_at: '2025-11-02 16:35:12+00', updated_at: '2025-11-02 16:35:13+00' },
      { id: 20, espacio_id: 5, disposicion_id: 5, capacidad: 60, created_at: '2025-11-02 16:35:27+00', updated_at: '2025-11-02 16:35:29+00' },
      { id: 21, espacio_id: 6, disposicion_id: 7, capacidad: 12, created_at: '2025-11-02 16:35:48+00', updated_at: '2025-11-02 16:35:50+00' },
      { id: 22, espacio_id: 6, disposicion_id: 2, capacidad: 12, created_at: '2025-11-02 16:36:04+00', updated_at: '2025-11-02 16:36:05+00' },
      { id: 23, espacio_id: 6, disposicion_id: 3, capacidad: 15, created_at: '2025-11-02 16:36:24+00', updated_at: '2025-11-02 16:36:25+00' },
    ]

    for (const r of rows) {
      await db.raw(
        `INSERT INTO public.configuraciones_espacio (id, espacio_id, disposicion_id, capacidad, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           espacio_id = EXCLUDED.espacio_id,
           disposicion_id = EXCLUDED.disposicion_id,
           capacidad = EXCLUDED.capacidad,
           created_at = EXCLUDED.created_at,
           updated_at = EXCLUDED.updated_at;`,
        [r.id, r.espacio_id, r.disposicion_id, r.capacidad, r.created_at, r.updated_at]
      )
    }

    // Nota: no eliminamos registros existentes; solo upsert
  }
}
