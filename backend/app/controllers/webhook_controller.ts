import type { HttpContext } from '@adonisjs/core/http'
import Env from '#start/env'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export default class WebhookController {
  /**
   * Trigger rebuild del frontend cuando hay cambios en contenido
   */
  async triggerRebuild({ response }: HttpContext) {
    try {
      const webhookUrl = Env.get('FRONTEND_REBUILD_WEBHOOK_URL')
      const isProduction = Env.get('NODE_ENV') === 'production'
      
      // En localhost: ejecutar build localmente
      if (!isProduction) {
        try {
          const frontendPath = Env.get('FRONTEND_PATH', '../frontend')
          console.log('🔨 Iniciando build local del frontend...')
          
          // Ejecutar build en el directorio del frontend
          await execAsync('npm run build', {
            cwd: frontendPath,
            timeout: 120000 // 2 minutos timeout
          })
          
          console.log('✅ Build local completado')
          
          return response.status(200).json({
            success: true,
            message: 'Build local completado exitosamente',
            environment: 'development'
          })
        } catch (buildError: any) {
          console.error('❌ Error en build local:', buildError)
          return response.status(500).json({
            success: false,
            message: 'Error al ejecutar build local',
            error: buildError.message
          })
        }
      }
      
      // En producción: disparar webhook de Vercel/Netlify
      if (!webhookUrl) {
        return response.status(503).json({
          success: false,
          message: 'Webhook no configurado'
        })
      }

      // Disparar webhook (Vercel, Netlify, etc.)
      const rebuildResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!rebuildResponse.ok) {
        throw new Error('Error al disparar rebuild')
      }

      return response.json({
        success: true,
        message: 'Rebuild iniciado correctamente en producción',
        environment: 'production'
      })
    } catch (error) {
      console.error('Error triggering rebuild:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al iniciar rebuild'
      })
    }
  }
}
