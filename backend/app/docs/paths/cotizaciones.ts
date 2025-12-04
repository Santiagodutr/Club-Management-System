/**
 * @openapi
 * /api/cotizaciones/disponibilidad:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Verificar disponibilidad de fecha para un espacio
 *     parameters:
 *       - name: espacioId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del espacio a consultar
 *       - name: fecha
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha en formato YYYY-MM-DD
 *       - name: horaInicio
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "10:00"
 *         description: Hora de inicio en formato HH:mm (default 08:00)
 *       - name: duracion
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 4
 *           maximum: 8
 *         description: Duración en horas (4 u 8 horas base. Las horas adicionales se cobran aparte)
 *       - name: tipoEvento
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [social, empresarial, capacitacion]
 *         description: Tipo de evento
 *     responses:
 *       '200':
 *         description: Disponibilidad verificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     disponible:
 *                       type: boolean
 *                     mensaje:
 *                       type: string
 *       '400':
 *         description: Parámetros faltantes o inválidos
 *       '500':
 *         description: Error interno del servidor
 *
 * /api/cotizaciones:
 *   post:
 *     tags: [Cotizaciones]
 *     summary: Crear nueva cotización
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - espacioId
 *               - configuracionEspacioId
 *               - fecha
 *               - horaInicio
 *               - duracion
 *               - tipoEvento
 *               - asistentes
 *               - tipoCliente
 *               - nombre
 *               - email
 *             properties:
 *               espacioId:
 *                 type: integer
 *               configuracionEspacioId:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-05"
 *               horaInicio:
 *                 type: string
 *                 example: "10:00"
 *               duracion:
 *                 type: integer
 *                 minimum: 4
 *                 maximum: 8
 *               tipoEvento:
 *                 type: string
 *                 enum: [social, empresarial, capacitacion]
 *               asistentes:
 *                 type: integer
 *                 minimum: 1
 *               tipoCliente:
 *                 type: string
 *                 enum: [socio, particular]
 *               codigoSocio:
 *                 type: string
 *                 description: Código del socio (requerido si tipoCliente es 'socio')
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de servicios adicionales
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Cotización creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     cotizacion:
 *                       type: object
 *                     detalles:
 *                       type: array
 *                     total:
 *                       type: number
 *                     montoAbono:
 *                       type: number
 *       '400':
 *         description: Validación fallida
 *       '500':
 *         description: Error al crear cotización
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Listar cotizaciones con filtros
 *     parameters:
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pendiente, aceptada, rechazada, vencida]
 *       - name: email
 *         in: query
 *         schema:
 *           type: string
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Lista de cotizaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *
 * /api/cotizaciones/{id}:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Obtener detalle de cotización
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detalle de la cotización
 *       '404':
 *         description: Cotización no encontrada
 *   post:
 *     tags: [Cotizaciones]
 *     summary: Confirmar cotización (aceptar)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Cotización confirmada
 *       '404':
 *         description: Cotización no encontrada
 *       '400':
 *         description: No se puede confirmar en este estado
 *
 * /api/cotizaciones/{id}/pago:
 *   post:
 *     tags: [Cotizaciones]
 *     summary: Registrar pago de cotización
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *             properties:
 *               monto:
 *                 type: number
 *               tipo_pago:
 *                 type: string
 *                 enum: [transferencia, efectivo, tarjeta, cheque]
 *     responses:
 *       '200':
 *         description: Pago registrado
 *       '400':
 *         description: Error en validación del pago
 *       '404':
 *         description: Cotización no encontrada
 *
 * /api/cotizaciones/{id}/pdf:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Descargar cotización en PDF
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Cotización no encontrada
 *       '500':
 *         description: Error al generar PDF
 *
 * /api/cotizaciones/{id}/enviar-correo:
 *   post:
 *     tags: [Cotizaciones]
 *     summary: Enviar correos de notificación de una cotización (prueba)
 *     description: Envía los correos de notificación al cliente y al gerente para una cotización existente. Útil para reenviar o probar el sistema de emails.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cotización
 *     responses:
 *       '200':
 *         description: Correos enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     clienteEnviado:
 *                       type: boolean
 *                       description: Si el correo al cliente fue enviado
 *                     gerenteEnviado:
 *                       type: boolean
 *                       description: Si el correo al gerente fue enviado
 *                     errores:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de errores si los hubo
 *       '404':
 *         description: Cotización no encontrada
 *       '500':
 *         description: Error al enviar correos
 */
export const openapicotizacionesPaths = {}
