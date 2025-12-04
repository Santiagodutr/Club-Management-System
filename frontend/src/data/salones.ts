// Datos de los salones para el blog
// En producción, esto vendría de una base de datos o CMS

export interface SalonImage {
  id: string;
  url: string;
  alt: string;
  isMain?: boolean;
}

export interface SalonBlog {
  id: string;
  nombre: string;
  slug: string;
  subtitulo: string;
  descripcionCorta: string;
  descripcionCompleta: string;
  caracteristicas: string[];
  serviciosIncluidos: string[];
  capacidad: {
    minima: number;
    maxima: number;
  };
  dimensiones: string;
  imagenes: SalonImage[];
  horarioDisponible: string;
  precioDesde: string;
  destacado: boolean;
  fechaActualizacion: string;
}

// Datos mock - en producción vendrían de una API/DB
export const salonesData: SalonBlog[] = [
  {
    id: '1',
    nombre: 'Mi Llanura',
    slug: 'mi-llanura',
    subtitulo: 'El corazón de los eventos del club',
    descripcionCorta: 'Salón insignia con vista a las áreas verdes, ambientación adaptable. Ideal para recepciones y eventos sociales.',
    descripcionCompleta: `
      <p><strong>Mi Llanura</strong> es el salón más emblemático del Club del Meta. Con una arquitectura que combina elegancia y funcionalidad, este espacio se ha convertido en el escenario preferido para los eventos más importantes de nuestra comunidad.</p>
      
      <h3>Historia y Tradición</h3>
      <p>Inaugurado en 1985, Mi Llanura ha sido testigo de miles de celebraciones familiares, corporativas y sociales. Su nombre rinde homenaje a los extensos llanos orientales que caracterizan nuestra región.</p>
      
      <h3>Ambiente y Decoración</h3>
      <p>El salón cuenta con amplios ventanales que ofrecen una vista privilegiada hacia los jardines del club. La iluminación natural se complementa con un sistema de luces LED programables que permiten crear diferentes ambientes según el tipo de evento.</p>
      
      <h3>Versatilidad</h3>
      <p>Gracias a su diseño modular, Mi Llanura puede adaptarse a diferentes configuraciones: formato teatro, banquete, coctel o reunión ejecutiva. El mobiliario premium y la decoración neutral permiten personalizar el espacio según las necesidades de cada cliente.</p>
    `,
    caracteristicas: [
      'Vista panorámica a jardines',
      'Sistema de sonido profesional',
      'Iluminación LED programable',
      'Aire acondicionado central',
      'Acceso para personas con movilidad reducida',
      'Estacionamiento privado para 50 vehículos',
      'Cocina industrial anexa',
      'Camerino para novios/artistas'
    ],
    serviciosIncluidos: [
      'Montaje básico de mesas y sillas',
      'Mantelería blanca estándar',
      'Personal de seguridad',
      'Limpieza post-evento',
      'Coordinador de eventos'
    ],
    capacidad: {
      minima: 50,
      maxima: 100
    },
    dimensiones: '250 m² de área útil',
    imagenes: [
      { id: 'ml1', url: '/src/assets/millanura.jpg', alt: 'Vista principal del salón Mi Llanura', isMain: true },
      { id: 'ml2', url: '/src/assets/millanura.jpg', alt: 'Configuración banquete Mi Llanura' },
      { id: 'ml3', url: '/src/assets/millanura.jpg', alt: 'Detalles de iluminación Mi Llanura' },
    ],
    horarioDisponible: 'Lunes a Domingo: 8:00 AM - 12:00 AM',
    precioDesde: '$2,500,000 COP',
    destacado: true,
    fechaActualizacion: '2024-12-01'
  },
  {
    id: '2',
    nombre: 'Bar',
    slug: 'bar',
    subtitulo: 'Sofisticación y estilo urbano',
    descripcionCorta: 'Ambiente contemporáneo con barra integrada, iluminación escénica y sistema de sonido premium. Perfecto para cocteles y lanzamientos.',
    descripcionCompleta: `
      <p>El <strong>Bar del Club</strong> representa la fusión perfecta entre elegancia y modernidad. Este espacio ha sido diseñado para quienes buscan un ambiente sofisticado para sus eventos más exclusivos.</p>
      
      <h3>Diseño Contemporáneo</h3>
      <p>Con acabados en madera noble y detalles en acero inoxidable, el Bar ofrece una estética urbana que contrasta armoniosamente con el entorno natural del club. La barra de 8 metros es el punto focal del espacio.</p>
      
      <h3>Experiencia Gastronómica</h3>
      <p>Contamos con un equipo de bartenders certificados y una carta de cocteles exclusiva. Podemos crear bebidas personalizadas para su evento o trabajar con su proveedor de preferencia.</p>
      
      <h3>Eventos Ideales</h3>
      <p>Lanzamientos de productos, after office corporativos, despedidas de soltero/a, celebraciones de cumpleaños y cualquier evento que requiera un ambiente íntimo pero vibrante.</p>
    `,
    caracteristicas: [
      'Barra profesional de 8 metros',
      'Sistema de sonido envolvente',
      'Iluminación ambiental personalizable',
      'Pantallas LED de 55 pulgadas',
      'Zona lounge con sofás',
      'Terraza privada anexa',
      'Refrigeradores industriales',
      'Máquina de hielo profesional'
    ],
    serviciosIncluidos: [
      'Bartender profesional (4 horas)',
      'Cristalería especializada',
      'Hielo ilimitado',
      'Servilletas y posavasos',
      'Música ambiental'
    ],
    capacidad: {
      minima: 20,
      maxima: 60
    },
    dimensiones: '120 m² incluyendo terraza',
    imagenes: [
      { id: 'bar1', url: '/src/assets/bar.jpg', alt: 'Vista de la barra principal', isMain: true },
      { id: 'bar2', url: '/src/assets/bar.jpg', alt: 'Zona lounge del Bar' },
      { id: 'bar3', url: '/src/assets/bar.jpg', alt: 'Terraza del Bar' },
    ],
    horarioDisponible: 'Martes a Domingo: 4:00 PM - 2:00 AM',
    precioDesde: '$1,800,000 COP',
    destacado: true,
    fechaActualizacion: '2024-11-28'
  },
  {
    id: '3',
    nombre: 'Empresarial',
    slug: 'empresarial',
    subtitulo: 'Productividad en un entorno premium',
    descripcionCorta: 'Equipado con pantallas, streaming y mobiliario modular para workshops, conferencias y directorios. Conectividad y soporte técnico continuo.',
    descripcionCompleta: `
      <p>El <strong>Salón Empresarial</strong> ha sido diseñado pensando en las necesidades del mundo corporativo moderno. Es el espacio ideal para reuniones de alto nivel que requieren tecnología de punta y un ambiente profesional.</p>
      
      <h3>Tecnología de Última Generación</h3>
      <p>Equipado con sistema de videoconferencia 4K, pantallas interactivas, conexión de fibra óptica dedicada y sistema de audio para conferencias. Compatible con todas las plataformas de reuniones virtuales.</p>
      
      <h3>Configuraciones Flexibles</h3>
      <p>El mobiliario modular permite configuraciones en U, herradura, teatro o mesa de directorio. Las mesas incluyen tomas de corriente y puertos USB integrados para mayor comodidad de los asistentes.</p>
      
      <h3>Servicios Corporativos</h3>
      <p>Ofrecemos coffee breaks gourmet, servicio de catering ejecutivo, secretariado bilingüe y asistencia técnica permanente durante su evento.</p>
    `,
    caracteristicas: [
      'Sistema de videoconferencia 4K',
      'Pantalla interactiva de 85 pulgadas',
      'Fibra óptica dedicada 500 Mbps',
      'Mesas con tomas de corriente',
      'Sillas ergonómicas ejecutivas',
      'Insonorización acústica',
      'Control de acceso biométrico',
      'Impresora/escáner disponible'
    ],
    serviciosIncluidos: [
      'Soporte técnico continuo',
      'Pizarra digital',
      'Marcadores y papelería',
      'Agua y café de cortesía',
      'WiFi de alta velocidad'
    ],
    capacidad: {
      minima: 10,
      maxima: 35
    },
    dimensiones: '80 m² de área de reunión',
    imagenes: [
      { id: 'emp1', url: '/src/assets/empresarial.jpg', alt: 'Configuración de directorio', isMain: true },
      { id: 'emp2', url: '/src/assets/empresarial.jpg', alt: 'Sistema de videoconferencia' },
      { id: 'emp3', url: '/src/assets/empresarial.jpg', alt: 'Detalle de mobiliario ejecutivo' },
    ],
    horarioDisponible: 'Lunes a Viernes: 7:00 AM - 9:00 PM | Sábados: 8:00 AM - 2:00 PM',
    precioDesde: '$800,000 COP (4 horas)',
    destacado: false,
    fechaActualizacion: '2024-11-25'
  },
  {
    id: '4',
    nombre: 'Terraza',
    slug: 'terraza',
    subtitulo: 'Donde el cielo es el límite',
    descripcionCorta: 'Espacio al aire libre con pérgolas, iluminación ambiental y vista privilegiada. Eventos sunset, matrimonios y brunchs.',
    descripcionCompleta: `
      <p>La <strong>Terraza</strong> del Club del Meta es nuestro espacio más romántico y natural. Ideal para quienes desean celebrar bajo las estrellas o disfrutar de un atardecer llanero inolvidable.</p>
      
      <h3>Entorno Natural</h3>
      <p>Rodeada de jardines cuidadosamente diseñados, la terraza ofrece vistas panorámicas de 180 grados hacia las montañas. La vegetación nativa crea un ambiente fresco y aromático que complementa cualquier celebración.</p>
      
      <h3>Infraestructura</h3>
      <p>Pérgolas de madera con toldos retráctiles, piso en piedra natural, sistema de iluminación con luces colgantes tipo fairy lights y conexiones eléctricas distribuidas para equipos de sonido y catering.</p>
      
      <h3>Momentos Especiales</h3>
      <p>La terraza es el escenario preferido para ceremonias de matrimonio, pedidas de mano, cenas románticas y celebraciones íntimas. El clima de la región permite su uso la mayor parte del año.</p>
    `,
    caracteristicas: [
      'Vista panorámica 180°',
      'Pérgolas con toldos retráctiles',
      'Sistema de iluminación fairy lights',
      'Jardines paisajísticos',
      'Fuente decorativa',
      'Zona de fotos',
      'Conexiones eléctricas múltiples',
      'Baños exclusivos cercanos'
    ],
    serviciosIncluidos: [
      'Montaje de sillas tipo tiffany',
      'Arco decorativo (bodas)',
      'Alfombra para pasillo',
      'Coordinador de ceremonia',
      'Plan B en caso de lluvia'
    ],
    capacidad: {
      minima: 15,
      maxima: 30
    },
    dimensiones: '150 m² de área techada + jardín',
    imagenes: [
      { id: 'ter1', url: '/src/assets/terraza.jpg', alt: 'Vista general de la terraza', isMain: true },
      { id: 'ter2', url: '/src/assets/terraza.jpg', alt: 'Montaje para ceremonia' },
      { id: 'ter3', url: '/src/assets/terraza.jpg', alt: 'Atardecer desde la terraza' },
    ],
    horarioDisponible: 'Todos los días: 10:00 AM - 11:00 PM',
    precioDesde: '$1,500,000 COP',
    destacado: true,
    fechaActualizacion: '2024-12-02'
  },
  {
    id: '5',
    nombre: 'Kiosko',
    slug: 'kiosko',
    subtitulo: 'Tradición y naturaleza',
    descripcionCorta: 'Área semiabierta rodeada de jardines, piso en deck y estaciones eléctricas para música en vivo. Reuniones familiares y celebraciones.',
    descripcionCompleta: `
      <p>El <strong>Kiosko</strong> evoca la tradición de las construcciones típicas llaneras, ofreciendo un espacio cálido y acogedor en medio de la naturaleza. Es el lugar perfecto para eventos familiares y celebraciones informales.</p>
      
      <h3>Arquitectura Tradicional</h3>
      <p>Construido con materiales nobles como madera de teca y palma real, el kiosko mantiene la esencia de la arquitectura regional. El techo alto permite una excelente ventilación natural.</p>
      
      <h3>Zona de Parrilla</h3>
      <p>Cuenta con una parrilla profesional de carbón y una zona de preparación de alimentos. Ideal para asados, sancochos y la tradicional mamona llanera. El humo se canaliza eficientemente lejos del área de invitados.</p>
      
      <h3>Música y Entretenimiento</h3>
      <p>Estaciones eléctricas y acústica optimizada para música en vivo. Es común escuchar joropo y música llanera en vivo durante los eventos. También cuenta con zona de juegos para niños cercana.</p>
    `,
    caracteristicas: [
      'Arquitectura típica llanera',
      'Parrilla profesional de carbón',
      'Piso en deck de madera',
      'Ventilación natural cruzada',
      'Zona de preparación de alimentos',
      'Conexiones para música en vivo',
      'Mesas de madera rústica',
      'Zona de juegos infantiles cercana'
    ],
    serviciosIncluidos: [
      'Carbón vegetal',
      'Utensilios de parrilla',
      'Mesas y bancas rústicas',
      'Servicio de aseo',
      'Vigilancia del área'
    ],
    capacidad: {
      minima: 30,
      maxima: 60
    },
    dimensiones: '180 m² techados + área exterior',
    imagenes: [
      { id: 'kio1', url: '/src/assets/kiosko.jpg', alt: 'Vista del kiosko principal', isMain: true },
      { id: 'kio2', url: '/src/assets/kiosko.jpg', alt: 'Zona de parrilla' },
      { id: 'kio3', url: '/src/assets/kiosko.jpg', alt: 'Área de mesas' },
    ],
    horarioDisponible: 'Viernes a Domingo: 10:00 AM - 10:00 PM',
    precioDesde: '$1,200,000 COP',
    destacado: false,
    fechaActualizacion: '2024-11-20'
  },
  {
    id: '6',
    nombre: 'Presidente',
    slug: 'presidente',
    subtitulo: 'Exclusividad sin compromisos',
    descripcionCorta: 'Espacio exclusivo con mobiliario ejecutivo, insonorización y servicio gourmet personalizado. Juntas corporativas y sesiones privadas.',
    descripcionCompleta: `
      <p>El <strong>Salón Presidente</strong> es el espacio más exclusivo del Club del Meta. Diseñado para reuniones de alto perfil que requieren absoluta privacidad, discreción y servicios de primera clase.</p>
      
      <h3>Privacidad Garantizada</h3>
      <p>Acceso independiente con control biométrico, insonorización certificada y protocolo de confidencialidad para el personal de servicio. Ideal para negociaciones sensibles y reuniones de directorio.</p>
      
      <h3>Servicio Premium</h3>
      <p>Mayordomo personal asignado, menú gourmet diseñado por nuestro chef ejecutivo, selección de vinos y licores premium, y servicio de tabaco fino bajo solicitud.</p>
      
      <h3>Comodidades Ejecutivas</h3>
      <p>Sillones de cuero italiano, mesa de juntas en madera de nogal, minibar privado, baño con ducha y vestidor. Todo pensado para que nuestros huéspedes más distinguidos se sientan como en casa.</p>
    `,
    caracteristicas: [
      'Acceso independiente privado',
      'Insonorización certificada',
      'Mesa de nogal para 15 personas',
      'Sillones de cuero italiano',
      'Minibar premium incluido',
      'Baño privado con ducha',
      'Sistema de seguridad dedicado',
      'Arte original en las paredes'
    ],
    serviciosIncluidos: [
      'Mayordomo personal',
      'Menú gourmet de 3 tiempos',
      'Selección de vinos premium',
      'Café de origen especial',
      'Servicio de valet parking'
    ],
    capacidad: {
      minima: 5,
      maxima: 15
    },
    dimensiones: '60 m² de salón + áreas de servicio',
    imagenes: [
      { id: 'pre1', url: '/src/assets/presidencial.jpg', alt: 'Mesa de directorio Presidente', isMain: true },
      { id: 'pre2', url: '/src/assets/presidencial.jpg', alt: 'Área lounge Presidente' },
      { id: 'pre3', url: '/src/assets/presidencial.jpg', alt: 'Detalles de decoración' },
    ],
    horarioDisponible: 'Previa cita: 24/7',
    precioDesde: '$3,500,000 COP',
    destacado: true,
    fechaActualizacion: '2024-12-03'
  }
];

// Función para obtener un salón por su slug
export function getSalonBySlug(slug: string): SalonBlog | undefined {
  return salonesData.find(salon => salon.slug === slug);
}

// Función para obtener todos los salones destacados
export function getSalonesDestacados(): SalonBlog[] {
  return salonesData.filter(salon => salon.destacado);
}

// Función para obtener todos los slugs (útil para generar páginas estáticas)
export function getAllSlugs(): string[] {
  return salonesData.map(salon => salon.slug);
}
