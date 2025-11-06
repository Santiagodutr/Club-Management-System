/**
 * @openapi
 * /me:
 *   get:
 *     tags: [Users]
 *     summary: Perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Usuario actual
 *       '401':
 *         description: No autenticado
 */
export const openapiUsersPaths = {}
