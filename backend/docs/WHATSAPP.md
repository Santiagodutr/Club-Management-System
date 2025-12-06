# Integración de WhatsApp Business API

Este documento explica cómo está configurada la integración de WhatsApp para enviar notificaciones de cotizaciones.

## Configuración Requerida

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
WHATSAPP_PHONE_NUMBER_ID=857263457477016
WHATSAPP_ACCESS_TOKEN=EAAburcopzwYBOxxxxxxxxxxxxxxxxx
WHATSAPP_API_VERSION=v22.0
```

### 2. Obtener Credenciales de WhatsApp Business

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea o selecciona tu app de WhatsApp Business
3. Ve a **WhatsApp > Getting Started**
4. Copia el **Phone Number ID** (ID del número de teléfono de WhatsApp Business)
5. Genera un **Access Token** permanente en **WhatsApp > Configuration**

### 3. Configurar Teléfono del Gerente en la Base de Datos

El teléfono del gerente se obtiene desde la tabla `datos_empresa`:

```sql
UPDATE datos_empresa 
SET whatsapp_gerente = '573177541315' 
WHERE key = 'empresa';
```

**Nota:** El sistema busca automáticamente el registro con `key = 'empresa'` para obtener el número del gerente.

### 4. Crear Bucket en Supabase

Los PDFs se suben a Supabase Storage antes de enviarlos por WhatsApp:

1. Ve a tu proyecto en Supabase
2. Ve a **Storage**
3. Crea un nuevo bucket llamado `cotizaciones_pdf`
4. Configúralo como **público** para que las URLs funcionen

**Configuración del bucket:**
```json
{
  "public": true,
  "allowedMimeTypes": ["application/pdf"],
  "fileSizeLimit": 10485760
}
```

### 5. Políticas de Supabase (RLS)

Agrega estas políticas SQL en Supabase:

```sql
-- Permitir subida de archivos (desde backend)
CREATE POLICY "Allow backend uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cotizaciones_pdf');

-- Permitir lectura pública de PDFs
CREATE POLICY "Public access to PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cotizaciones_pdf');
```

## Cómo Funciona

### Flujo de Envío

1. **Cliente crea cotización** con su número de teléfono
2. **Backend genera PDF** usando PDFService
3. **PDF se sube a Supabase Storage** en el bucket `cotizaciones_pdf`
4. **Se obtiene URL pública** del PDF
5. **WhatsApp envía documento** al cliente y al gerente con la URL

### Formato de Números de Teléfono

Los números deben estar en formato internacional sin símbolos:

```
Correcto: 573177541315
Incorrecto: +57 317 754 1315
Incorrecto: (317) 754-1315
```

El servicio incluye el método `formatPhoneNumber()` que limpia automáticamente el formato.

### Tipos de Mensajes

#### 1. Documento (PDF)
```typescript
await whatsappService.sendDocument({
  to: '573177541315',
  documentUrl: 'https://url-del-pdf.com/archivo.pdf',
  filename: 'Cotizacion_123.pdf',
  caption: 'Aquí está tu cotización'
})
```

#### 2. Template (Mensajes Predefinidos)
```typescript
await whatsappService.sendTemplate({
  to: '573177541315',
  templateName: 'nombre_template',
  languageCode: 'es'
})
```

### Método Principal

```typescript
const resultadoWhatsApp = await whatsappService.enviarCotizacion(
  telefonoCliente,      // '573177541315'
  telefonoGerente,      // '573177541315'
  pdfUrl,               // 'https://...'
  numeroCotizacion      // '123'
)

// Retorna:
// {
//   cliente: true,   // true si se envió al cliente
//   gerente: true    // true si se envió al gerente
// }
```

## Testing

### Probar Envío Manual

Puedes probar el envío desde el backend con este código:

```typescript
import WhatsAppService from '#services/whatsapp_service'

const whatsapp = new WhatsAppService()

// Enviar documento
await whatsapp.sendDocument({
  to: '573177541315',
  documentUrl: 'https://tu-bucket.supabase.co/storage/v1/object/public/cotizaciones_pdf/test.pdf',
  filename: 'Test.pdf',
  caption: 'Mensaje de prueba'
})
```

### Probar con cURL

```bash
curl -i -X POST \
  https://graph.facebook.com/v22.0/857263457477016/messages \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "573177541315",
    "type": "document",
    "document": {
      "link": "https://tu-url-publica.com/archivo.pdf",
      "filename": "Test.pdf",
      "caption": "Documento de prueba"
    }
  }'
```

## Mensajes de Error Comunes

### Error: Invalid phone number
- Verifica que el número esté en formato internacional sin símbolos
- Ejemplo correcto: `573177541315`

### Error: Access token expired
- Genera un nuevo token permanente en Meta for Developers
- Actualiza `WHATSAPP_ACCESS_TOKEN` en `.env`

### Error: Document link not accessible
- Verifica que la URL del PDF sea pública
- Asegúrate de que el bucket en Supabase esté configurado como público
- Prueba abrir la URL en el navegador

### Error: Template not found
- El template debe estar aprobado en Meta Business Suite
- Usa el nombre exacto del template aprobado

## Logs y Debugging

Los logs se guardan automáticamente:

```typescript
// Éxito
logger.info({ to, filename, messageId }, 'Documento enviado por WhatsApp')

// Error
logger.error({ response }, 'Error enviando documento por WhatsApp')
```

Para ver los logs en consola:
```bash
# En el terminal del backend
tail -f logs/app.log
```

## Límites de WhatsApp

- **Tamaño máximo de archivo**: 100 MB
- **Tipos de archivo permitidos**: PDF, DOC, DOCX, XLS, XLSX, etc.
- **Rate limits**: Depende de tu plan de WhatsApp Business
- **Templates**: Requieren aprobación de Meta (24-48 horas)

## Próximos Pasos

1. **Crear templates personalizados** en Meta Business Suite
2. **Agregar notificaciones** para otros eventos (aceptación, rechazo, pagos)
3. **Implementar webhooks** para recibir respuestas de clientes
4. **Dashboard de mensajes** para ver historial de envíos

## Recursos

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
