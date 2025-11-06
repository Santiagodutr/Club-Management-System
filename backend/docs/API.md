# Documentación de API (OpenAPI)

Este proyecto genera la especificación OpenAPI en runtime desde archivos "solo-docs" ubicados en `app/docs/**` y ofrece dos UIs:

- Redoc (lectura): `GET /docs`
- Swagger UI (interactivo): `GET /docs/swagger`

La especificación JSON puede consultarse en `GET /openapi.json`.

## Probar la API desde Swagger UI ("Try it out")

1. Levanta el servidor en desarrollo:
   ```bash
   npm run dev
   ```
2. Abre la UI:
   ```bash
   $BROWSER http://localhost:3333/docs/swagger
   ```
3. Autorízate si el endpoint requiere autenticación:
   - Clic en el botón "Authorize".
   - Selecciona `bearerAuth` y pega tu token JWT (sin el prefijo `Bearer `).
   - Acepta y cierra.
4. Navega a un endpoint y pulsa "Try it out" para enviar la petición.

> Nota: El esquema `bearerAuth` está definido en `app/docs/openapi.ts` dentro de `components.securitySchemes`.

## Cómo mantener la documentación

- Agrega/edita archivos en `app/docs/` (por ejemplo, `app/docs/paths/*.ts`).
- Escribe bloques JSDoc con la etiqueta `@openapi`.

Ejemplo mínimo:
```ts
/**
 * @openapi
 * /ejemplo:
 *   get:
 *     tags: [Ejemplo]
 *     summary: Endpoint de ejemplo
 *     responses:
 *       '200':
 *         description: OK
 */
export const exampleDoc = {}
```

Los archivos se combinan con la configuración base en `app/services/swagger_service.ts` usando `swagger-jsdoc`.
