/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     TipoRol:
 *       type: string
 *       enum: [admin, particular]
 *       description: Rol del usuario. 'admin' para administrador, 'particular' para usuario normal.
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID del usuario (mismo que auth.users.id)
 *         rol:
 *           $ref: '#/components/schemas/TipoRol'
 *         nombre_completo:
 *           type: string
 *           nullable: true
 *         telefono:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * tags:
 *   - name: Auth
 *     description: Autenticación y registro de usuarios
 *   - name: Users
 *     description: Operaciones de usuario autenticado
 *   - name: Admin
 *     description: Operaciones administrativas (solo para rol admin)
 */
export const openapiDocsRoot = {}
