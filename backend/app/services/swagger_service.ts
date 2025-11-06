import swaggerJsdoc from 'swagger-jsdoc'

// Servicio para generar el spec OpenAPI desde archivos "solo-docs"
// No ensucia controladores: toda la documentación vive en app/docs/**

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Club Management API',
      version: '1.0.0',
      description: 'API del sistema de gestión de club',
    },
    // Usa servidor relativo por defecto para evitar problemas de CORS y orígenes (localhost vs 127.0.0.1)
    // Puedes forzar uno específico con OPENAPI_SERVER_URL si lo necesitas en despliegues.
    servers: [
      { url: process.env.OPENAPI_SERVER_URL || '/' },
    ],
  },
  // Archivos "solo-docs" con anotaciones OpenAPI en JSDoc
  // Puedes agregar más globs si creas más archivos de documentación
  apis: [
    'app/docs/**/*.ts',
  ],
}

export function getOpenApiSpec() {
  return swaggerJsdoc(options)
}
