import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class TarifasSeeder extends BaseSeeder {
  public static environment = ['development', 'production', 'test']

  public async run() {
    const rows = [
      { id: 47, configuracion_espacio_id: 1, tipo_cliente: 'socio', precio_4_horas: '600000.00', precio_8_horas: '1200000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 48, configuracion_espacio_id: 2, tipo_cliente: 'socio', precio_4_horas: '600000.00', precio_8_horas: '1200000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 49, configuracion_espacio_id: 3, tipo_cliente: 'socio', precio_4_horas: '1000000.00', precio_8_horas: '1700000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 50, configuracion_espacio_id: 4, tipo_cliente: 'socio', precio_4_horas: '1000000.00', precio_8_horas: '1700000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 51, configuracion_espacio_id: 1, tipo_cliente: 'particular', precio_4_horas: '1500000.00', precio_8_horas: '2500000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 52, configuracion_espacio_id: 2, tipo_cliente: 'particular', precio_4_horas: '1500000.00', precio_8_horas: '2500000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 53, configuracion_espacio_id: 3, tipo_cliente: 'particular', precio_4_horas: '1900000.00', precio_8_horas: '2800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 54, configuracion_espacio_id: 4, tipo_cliente: 'particular', precio_4_horas: '1900000.00', precio_8_horas: '2800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 55, configuracion_espacio_id: 5, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 56, configuracion_espacio_id: 6, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 57, configuracion_espacio_id: 7, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 58, configuracion_espacio_id: 8, tipo_cliente: 'socio', precio_4_horas: '200000.00', precio_8_horas: '400000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 59, configuracion_espacio_id: 10, tipo_cliente: 'socio', precio_4_horas: '400000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 60, configuracion_espacio_id: 5, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 61, configuracion_espacio_id: 6, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 62, configuracion_espacio_id: 7, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 63, configuracion_espacio_id: 8, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 64, configuracion_espacio_id: 10, tipo_cliente: 'particular', precio_4_horas: '700000.00', precio_8_horas: '1000000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 65, configuracion_espacio_id: 11, tipo_cliente: 'socio', precio_4_horas: '200000.00', precio_8_horas: '400000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 66, configuracion_espacio_id: 12, tipo_cliente: 'socio', precio_4_horas: '200000.00', precio_8_horas: '400000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 67, configuracion_espacio_id: 13, tipo_cliente: 'socio', precio_4_horas: '200000.00', precio_8_horas: '400000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 68, configuracion_espacio_id: 11, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 69, configuracion_espacio_id: 12, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 70, configuracion_espacio_id: 13, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 71, configuracion_espacio_id: 14, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 72, configuracion_espacio_id: 15, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 73, configuracion_espacio_id: 14, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 74, configuracion_espacio_id: 15, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 75, configuracion_espacio_id: 16, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 76, configuracion_espacio_id: 17, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 77, configuracion_espacio_id: 18, tipo_cliente: 'socio', precio_4_horas: null, precio_8_horas: '300000.00', cortesia: true, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 78, configuracion_espacio_id: 19, tipo_cliente: 'socio', precio_4_horas: '200000.00', precio_8_horas: '400000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 79, configuracion_espacio_id: 20, tipo_cliente: 'socio', precio_4_horas: '200000.00', precio_8_horas: '400000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 80, configuracion_espacio_id: 16, tipo_cliente: 'particular', precio_4_horas: '300000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 81, configuracion_espacio_id: 17, tipo_cliente: 'particular', precio_4_horas: '300000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 82, configuracion_espacio_id: 18, tipo_cliente: 'particular', precio_4_horas: '300000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 83, configuracion_espacio_id: 19, tipo_cliente: 'particular', precio_4_horas: '300000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 84, configuracion_espacio_id: 20, tipo_cliente: 'particular', precio_4_horas: '400000.00', precio_8_horas: '800000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 85, configuracion_espacio_id: 21, tipo_cliente: 'socio', precio_4_horas: '300000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 86, configuracion_espacio_id: 22, tipo_cliente: 'socio', precio_4_horas: '300000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 87, configuracion_espacio_id: 23, tipo_cliente: 'socio', precio_4_horas: '300000.00', precio_8_horas: '600000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 88, configuracion_espacio_id: 21, tipo_cliente: 'particular', precio_4_horas: '1500000.00', precio_8_horas: '2500000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 89, configuracion_espacio_id: 22, tipo_cliente: 'particular', precio_4_horas: '1500000.00', precio_8_horas: '2500000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
      { id: 90, configuracion_espacio_id: 23, tipo_cliente: 'particular', precio_4_horas: '1500000.00', precio_8_horas: '2500000.00', cortesia: false, created_at: '2025-11-02 17:13:33.474077+00', updated_at: '2025-11-02 17:13:33.474077+00' },
    ]

    for (const r of rows) {
      await db.raw(
        `INSERT INTO public.tarifas (id, configuracion_espacio_id, tipo_cliente, precio_4_horas, precio_8_horas, cortesia, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           configuracion_espacio_id = EXCLUDED.configuracion_espacio_id,
           tipo_cliente = EXCLUDED.tipo_cliente,
           precio_4_horas = EXCLUDED.precio_4_horas,
           precio_8_horas = EXCLUDED.precio_8_horas,
           cortesia = EXCLUDED.cortesia,
           created_at = EXCLUDED.created_at,
           updated_at = EXCLUDED.updated_at;`,
        [
          r.id,
          r.configuracion_espacio_id,
          r.tipo_cliente,
          r.precio_4_horas,
          r.precio_8_horas,
          r.cortesia,
          r.created_at,
          r.updated_at,
        ]
      )
    }

    // Nota: no eliminamos registros existentes; solo upsert
  }
}
