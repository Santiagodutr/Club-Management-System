import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Socio from '#models/socio'

export default class extends BaseSeeder {
  async run() {
    // Verificar si ya existen socios
    const count = await Socio.query().count('* as total').first()
    if (count && count.$extras.total > 0) {
      console.log('Socios ya seeded, saltando...')
      return
    }

    await Socio.createMany([
      {
        codigo: 'SOC-001',
        activo: true,
      },
      {
        codigo: 'SOC-002',
        activo: true,
      },
      {
        codigo: 'SOC-003',
        activo: true,
      },
      {
        codigo: 'SOC-004',
        activo: true,
      },
      {
        codigo: 'SOC-005',
        activo: true,
      },
    ])

    console.log('✅ Socios seeded exitosamente con documentos')
  }
}
