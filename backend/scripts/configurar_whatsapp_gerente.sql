-- Configurar teléfono de WhatsApp del gerente
-- Ejecutar este script después de la migración

-- Actualizar el teléfono del gerente (formato internacional sin símbolos)
UPDATE datos_empresa 
SET whatsapp_gerente = '573177541315'
WHERE key = 'empresa';

-- Verificar que se actualizó correctamente
SELECT key, whatsapp_gerente, email_gerente 
FROM datos_empresa 
WHERE key = 'empresa';
