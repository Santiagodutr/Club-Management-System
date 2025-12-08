# ⚠️ PROBLEMA IDENTIFICADO: Mensajes enviados pero no recibidos

## Diagnóstico
Los logs muestran que WhatsApp API acepta los mensajes (status 200, message ID generado), pero **NO llegan al teléfono**.

```json
{
  "status": 200,
  "messageId": "wamid.HBgMNTczMTc3NTQxMzE1FQIAERgSQzkwQ0Q2RkVFNjNEM0IzQzY3AA==",
  "contacts": [{"wa_id": "573177541315"}]
}
```

✅ Esto significa que la API acepta el mensaje
❌ Pero Meta no lo entrega por restricciones de cuenta

## Causa Principal: Número de Prueba (Test Number)

Estás usando un **número de prueba de WhatsApp Business** que tiene limitaciones:

- ✅ Acepta mensajes en la API
- ❌ Solo entrega mensajes a números **previamente registrados** en Meta Business
- ❌ No puede enviar a números aleatorios

## SOLUCIÓN 1: Registrar números de destino (Inmediata)

### Paso 1: Ve a Meta for Developers
1. https://developers.facebook.com/apps/
2. Selecciona tu app
3. **WhatsApp → API Setup**

### Paso 2: Agregar números de prueba
En la sección **"To"** (destinatarios):
1. Busca el botón **"Manage phone number list"** o **"Add phone number"**
2. Agrega el número `+573177541315`
3. WhatsApp te enviará un **código de verificación de 6 dígitos** a ese número
4. Ingresa el código en Meta
5. El número quedará registrado

**Importante:** Solo puedes agregar **5 números** en modo de prueba.

### Paso 3: Prueba nuevamente
Crea una nueva cotización y verifica que ahora sí llegue el mensaje.

---

## SOLUCIÓN 2: Usar número oficial de WhatsApp Business (Recomendado)

Para enviar mensajes a cualquier número sin restricciones:

### Opción A: Verificar número de negocio oficial

1. **Verifica tu negocio en Meta**:
   - Ve a Meta Business Suite → Configuración
   - Verifica tu negocio (requiere documentos legales)

2. **Solicita número de teléfono oficial**:
   - WhatsApp → Phone Numbers
   - "Add phone number"
   - Sigue el proceso de verificación

3. **Actualiza credenciales en `.env`**:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=<nuevo_phone_number_id>
   WHATSAPP_ACCESS_TOKEN=<nuevo_access_token_permanente>
   ```

### Opción B: Usar número existente
Si ya tienes WhatsApp Business en tu teléfono:

1. Conecta ese número a la API
2. Genera credenciales permanentes
3. Actualiza el `.env`

---

## SOLUCIÓN 3: Verificar Tier de mensajería

Tu cuenta puede estar en "Tier 1" con límites:

### Ver límites actuales:
1. Meta for Developers → Tu App
2. WhatsApp → Insights
3. Revisa **"Messaging Limits"**

**Tiers de WhatsApp Business:**
- **Tier 1**: 1,000 conversaciones/día (cuenta nueva)
- **Tier 2**: 10,000 conversaciones/día
- **Tier 3**: 100,000 conversaciones/día
- **Tier 4**: Ilimitado

Si estás en Tier 1 y no has verificado tu negocio, **Meta puede estar bloqueando mensajes** para proteger contra spam.

---

## SOLUCIÓN 4: Verificar estado del número

### ¿El número receptor tiene WhatsApp activo?

Verifica que `573177541315` esté registrado en WhatsApp:

1. **Desde otro WhatsApp**:
   - Intenta agregar el número como contacto
   - Abre WhatsApp y busca ese contacto
   - Si NO aparece = el número no está en WhatsApp

2. **Desde la API de Meta**:
   ```bash
   curl -X GET \
     'https://graph.facebook.com/v22.0/857263457477016/whatsapp_business_profile' \
     -H 'Authorization: Bearer TU_ACCESS_TOKEN'
   ```

---

## SOLUCIÓN 5: Revisar plantillas (Templates)

Si usas **templates** en lugar de mensajes personalizados:

### Verificar plantillas aprobadas:
1. Meta for Developers → WhatsApp → Message Templates
2. Asegúrate de que las plantillas estén **"Approved"** (no "Pending" o "Rejected")
3. Solo puedes enviar templates aprobados

**Nota:** Los mensajes con documentos (PDFs) no requieren template SI el usuario ha iniciado conversación contigo en las últimas 24 horas.

---

## VERIFICACIÓN RÁPIDA

### Test 1: Enviar template desde Meta UI
1. https://developers.facebook.com/apps/
2. Tu App → WhatsApp → API Setup
3. Sección "Send and receive messages"
4. Envía un **template** a tu número (573177541315)
5. Si llega → el problema es con mensajes personalizados
6. Si NO llega → el número no está registrado

### Test 2: Enviar mensaje simple (texto)
Crea un endpoint de prueba:

```typescript
// En routes.ts
router.post('/test/whatsapp', async ({ request, response }) => {
  const whatsapp = new WhatsAppService()
  const { to } = request.only(['to'])
  
  const result = await whatsapp.sendTemplate({
    to: to || '573177541315',
    templateName: 'hello_world', // Template por defecto
    languageCode: 'es',
  })
  
  return response.json({ success: result })
})
```

Llama a:
```bash
POST http://localhost:3333/test/whatsapp
{"to": "573177541315"}
```

Si este sí llega → el problema son los documentos/PDFs

---

## RESUMEN DE ACCIONES

### ✅ Hacer AHORA:
1. **Registra el número 573177541315** en Meta Business como número de prueba
2. Verifica el código que te llegará
3. Prueba crear una cotización nuevamente

### ✅ Hacer después:
1. Verifica tu negocio en Meta
2. Conecta un número oficial de WhatsApp Business
3. Genera access token permanente

### ❌ NO hagas:
- ❌ Cambiar código (ya funciona correctamente)
- ❌ Generar más tokens temporales
- ❌ Modificar el formato de números

---

## Enlaces Útiles

- **Registrar números de prueba**: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started#send-messages
- **Verificar negocio**: https://business.facebook.com/settings/info
- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api/overview

---

## Siguiente Paso Inmediato

**Ve AHORA a:**
https://developers.facebook.com/apps/

1. Selecciona tu app
2. WhatsApp → API Setup
3. En la sección **"To"**, haz clic en **"Manage phone number list"**
4. Agrega `+573177541315`
5. Verifica con el código que te llegue
6. Prueba de nuevo

¡Debería funcionar inmediatamente después de esto! 📱✅
