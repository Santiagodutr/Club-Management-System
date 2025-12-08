# Debugging WhatsApp - Mensajes no llegan

## Problema Identificado
Los mensajes de WhatsApp no están llegando aunque el backend reporta que se envían exitosamente.

## Causas Comunes

### 1. **Bucket de Supabase no público** ⚠️ (MÁS PROBABLE)
WhatsApp necesita poder descargar el PDF desde la URL pública antes de enviarlo.

**Solución:**
1. Ve a Supabase Dashboard → Storage → `cotizaciones_pdf`
2. Haz clic en el bucket
3. Ve a "Configuration" o "Settings"
4. Activa "Public bucket" ✅
5. Guarda los cambios

**Verificación:**
```bash
# La URL debe ser accesible sin autenticación
curl -I https://tu-proyecto.supabase.co/storage/v1/object/public/cotizaciones_pdf/archivo.pdf
# Debe retornar 200 OK
```

### 2. **Formato de número de teléfono incorrecto**
WhatsApp requiere formato E.164 (código país + número sin espacios ni símbolos)

**Formato correcto:**
- ✅ `573177541315` (Colombia)
- ❌ `+57 317 754 1315`
- ❌ `3177541315` (falta código de país)

**El código ya formatea automáticamente**, pero verifica en los logs.

### 3. **Token de WhatsApp expirado o sin permisos**
El access token puede haber expirado o no tener los permisos necesarios.

**Solución:**
1. Ve a Meta for Developers → Tu App → WhatsApp → API Setup
2. Copia un nuevo token temporal (válido 24h) o genera uno permanente
3. Actualiza `WHATSAPP_ACCESS_TOKEN` en `.env`
4. Reinicia el backend

### 4. **Número de teléfono no verificado**
El número del cliente debe estar registrado en WhatsApp.

**Verificación:**
- Intenta enviar desde la API de prueba de Meta
- Si falla allí también, el número no está en WhatsApp

### 5. **Límites de envío alcanzados**
WhatsApp Business tiene límites de mensajes según el tier de la cuenta.

**Verificación:**
- Revisa Meta for Developers → WhatsApp → Insights
- Verifica el "Messaging Limit" de tu cuenta

## Debugging con los nuevos logs

Ahora el backend registra información detallada. Busca en los logs:

### Logs de envío exitoso:
```
📤 Intentando enviar documento por WhatsApp
📦 Payload completo para WhatsApp
📥 Respuesta completa de WhatsApp API
✅ Documento enviado y aceptado por WhatsApp
```

### Logs de error:
```
❌ Error enviando documento por WhatsApp - Detalles completos
```

**Errores comunes y soluciones:**

#### Error 368: "URL couldn't be downloaded"
```json
{
  "error": {
    "message": "(#368) The provided URL could not be downloaded",
    "code": 368
  }
}
```
**Causa:** El PDF no es accesible públicamente
**Solución:** Hacer el bucket público (ver punto 1)

#### Error 131026: "Message Undeliverable"
```json
{
  "error": {
    "code": 131026,
    "message": "Message Undeliverable"
  }
}
```
**Causa:** Número de teléfono no válido o no registrado en WhatsApp
**Solución:** Verificar que el número esté en WhatsApp

#### Error 100: "Invalid parameter"
```json
{
  "error": {
    "code": 100,
    "message": "Invalid parameter"
  }
}
```
**Causa:** Formato incorrecto en el payload
**Solución:** Revisar los logs del payload enviado

## Testing Manual

### Probar con la API de Meta directamente:

1. Ve a https://developers.facebook.com/apps/
2. Selecciona tu app → WhatsApp → API Setup
3. En "Send and receive messages", prueba enviar un template:
   - To: Tu número de teléfono (con código país)
   - Template: Selecciona uno aprobado
   - Haz clic en "Send message"

Si funciona allí pero no en tu backend:
- ✅ El problema es la configuración del backend
- Revisa los logs detallados

Si NO funciona ni desde la interfaz de Meta:
- ❌ Problema con la configuración de WhatsApp Business
- Verifica permisos, número de teléfono, templates aprobados

## Checklist de Verificación

- [ ] Bucket `cotizaciones_pdf` en Supabase es público
- [ ] URL del PDF es accesible sin autenticación (probar en navegador)
- [ ] Access token de WhatsApp es válido
- [ ] Número de teléfono del cliente está registrado en WhatsApp
- [ ] Formato de número es correcto (código país + número)
- [ ] Los logs muestran el payload exacto enviado
- [ ] La respuesta de WhatsApp API está en los logs
- [ ] No hay límites de mensajería alcanzados

## Comando para ver logs en tiempo real

```bash
# En el backend
npm run dev

# Crear una cotización con teléfono
# Buscar en los logs:
# - 📄 PDF generado y subido
# - 🔍 Verificación de URL pública
# - 📞 Números de teléfono formateados
# - 📤 Intentando enviar documento por WhatsApp
# - 📥 Respuesta completa de WhatsApp API
```

## Solución Temporal: Usar Media ID en lugar de URL

Si el problema persiste, podemos cambiar a subir el PDF directamente a WhatsApp:

```typescript
// En lugar de usar URL directa:
const mediaId = await whatsappService.uploadMedia(pdfBuffer)
await whatsappService.sendDocumentByMediaId({ to, mediaId, filename, caption })
```

Esto es más lento pero más confiable.
