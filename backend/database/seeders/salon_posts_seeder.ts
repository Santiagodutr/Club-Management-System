import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SalonPost from '#models/salon_post'
import { DateTime } from 'luxon'

export default class SalonPostsSeeder extends BaseSeeder {
  async run() {
    // Limpiar posts existentes (opcional)
    // await SalonPost.query().delete()

    await SalonPost.createMany([
      {
        espacioId: 1, // Ajustar según tus espacios
        titulo: 'Conoce nuestro Salón Principal',
        slug: 'conoce-nuestro-salon-principal',
        content: `# Salón Principal

Nuestro **Salón Principal** es el espacio más versátil del club, ideal para todo tipo de eventos.

## Características

- Capacidad máxima: 200 personas
- Aire acondicionado central
- Sistema de sonido profesional
- Iluminación ajustable
- Acceso para personas con movilidad reducida

## Servicios incluidos

1. Montaje de mesas y sillas
2. Mantelería básica
3. Personal de servicio
4. Estacionamiento para invitados

## Ideal para

- Bodas y recepciones
- Conferencias empresariales
- Graduaciones
- Fiestas de cumpleaños
- Eventos corporativos

---

*Contáctanos para conocer nuestras tarifas especiales para socios.*`,
        mainImageUrl: null,
        publicado: true,
        publishedAt: DateTime.now(),
      },
      {
        espacioId: 2, // Ajustar según tus espacios
        titulo: 'Terraza El Mirador: Tu evento al aire libre',
        slug: 'terraza-el-mirador-evento-aire-libre',
        content: `# Terraza El Mirador

Disfruta de eventos únicos en nuestra **Terraza El Mirador**, con las mejores vistas de la ciudad.

## ¿Por qué elegir nuestra terraza?

### Vista panorámica
Ubicada en el piso superior, ofrece una vista de 180° que impresionará a tus invitados.

### Ambiente natural
Rodeada de jardines y vegetación, crea un ambiente fresco y relajante.

### Flexibilidad
Perfecta para eventos diurnos y nocturnos, con iluminación decorativa.

## Capacidad y disposición

| Disposición | Capacidad |
|-------------|-----------|
| Cóctel      | 150       |
| Banquete    | 80        |
| Teatro      | 120       |

## Servicios adicionales disponibles

- Toldo retráctil para días soleados
- Calefactores para noches frescas
- Barra de bebidas
- DJ y equipo de sonido

---

*Reserva con anticipación, especialmente para temporada alta.*`,
        mainImageUrl: null,
        publicado: true,
        publishedAt: DateTime.now(),
      },
      {
        espacioId: null,
        titulo: 'Próximamente: Nuevo Salón Ejecutivo',
        slug: 'proximamente-nuevo-salon-ejecutivo',
        content: `# Próximamente: Salón Ejecutivo

Estamos emocionados de anunciar la próxima apertura de nuestro **Salón Ejecutivo**.

## ¿Qué incluirá?

- Capacidad para 20 personas
- Mesa de juntas ejecutiva
- Pantalla 4K de 85"
- Sistema de videoconferencias
- Servicio de café y snacks premium

*Más detalles próximamente.*`,
        mainImageUrl: null,
        publicado: false, // Borrador, no publicado
        publishedAt: null,
      },
    ])

    console.log('✅ Salon posts seeded successfully')
  }
}
