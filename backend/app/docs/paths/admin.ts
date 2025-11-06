/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Obtener estadísticas del sistema
 *     description: Retorna estadísticas generales. Solo accesible para administradores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_usuarios:
 *                   type: integer
 *                 total_espacios:
 *                   type: integer
 *                 total_tarifas:
 *                   type: integer
 *                 activo:
 *                   type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '401':
 *         description: No autenticado
 *       '403':
 *         description: No tienes permisos de admin
 *
 * /admin/config/update:
 *   post:
 *     tags: [Admin]
 *     summary: Actualizar configuración del sistema
 *     description: Permite actualizar parámetros de configuración. Solo para admin.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, value]
 *             properties:
 *               key:
 *                 type: string
 *                 example: empresa_nombre
 *               value:
 *                 type: string
 *                 example: "Club El Meta"
 *     responses:
 *       '200':
 *         description: Configuración actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 key:
 *                   type: string
 *                 value:
 *                   type: string
 *       '400':
 *         description: Datos inválidos (falta key o value)
 *       '401':
 *         description: No autenticado
 *       '403':
 *         description: No tienes permisos de admin
 *
 * /admin/usuarios:
 *   get:
 *     tags: [Admin]
 *     summary: Listar todos los usuarios
 *     description: Retorna lista de todos los usuarios del sistema. Solo para admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *       '401':
 *         description: No autenticado
 *       '403':
 *         description: No tienes permisos de admin
 */
export const openapiAdminPaths = {}
