import type { HttpContext } from '@adonisjs/core/http'
import SalonPost from '#models/salon_post'
import { DateTime } from 'luxon'

export default class SalonPostsController {
  /**
   * Listar posts publicados (público, con cache)
   * GET /api/salon-posts
   */
  async index({ request, response }: HttpContext) {
    try {
      const espacioId = request.input('espacio_id')
      const limit = Math.min(parseInt(request.input('limit', '50')), 100)
      
      const query = SalonPost.query()
        .select('id', 'titulo', 'slug', 'content', 'imagenes', 'espacio_id', 'published_at')
        .where('publicado', true)
        .preload('espacio', (espacioQuery) => {
          espacioQuery.select('id', 'nombre', 'slug')
        })
        .orderBy('published_at', 'desc')
        .limit(limit)

      if (espacioId) {
        query.where('espacioId', espacioId)
      }

      const posts = await query

      // Cache para contenido público que no cambia frecuentemente
      response.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=120')

      return response.json({
        success: true,
        data: posts,
      })
    } catch (error) {
      console.error('Error al listar posts:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener los posts',
      })
    }
  }

  /**
   * Obtener un post por slug (público, con cache)
   * GET /api/salon-posts/:slug
   */
  async show({ params, response }: HttpContext) {
    try {
      const post = await SalonPost.query()
        .where('slug', params.slug)
        .where('publicado', true)
        .preload('espacio', (espacioQuery) => {
          espacioQuery.select('id', 'nombre', 'slug', 'imagenes')
        })
        .first()

      if (!post) {
        return response.status(404).json({
          success: false,
          message: 'Post no encontrado',
        })
      }

      // Cache para contenido público
      response.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=120')

      return response.json({
        success: true,
        data: post,
      })
    } catch (error) {
      console.error('Error al obtener post:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener el post',
      })
    }
  }

  /**
   * Listar todos los posts (admin)
   * GET /admin/salon-posts
   */
  async indexAdmin({ request, response }: HttpContext) {
    try {
      const limit = Math.min(parseInt(request.input('limit', '50')), 200)
      
      const posts = await SalonPost.query()
        .select('id', 'titulo', 'slug', 'espacio_id', 'imagenes', 'publicado', 'published_at', 'created_at', 'updated_at')
        .preload('espacio', (espacioQuery) => {
          espacioQuery.select('id', 'nombre')
        })
        .orderBy('created_at', 'desc')
        .limit(limit)

      return response.json({
        success: true,
        data: posts,
      })
    } catch (error) {
      console.error('Error al listar posts (admin):', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener los posts',
      })
    }
  }

  /**
   * Crear un nuevo post (admin)
   * POST /admin/salon-posts
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'espacioId',
        'titulo',
        'slug',
        'content',
        'mainImageUrl',
        'imagenes',
        'publicado',
        'publishedAt',
      ])

      // Generar slug si no viene
      if (!data.slug && data.titulo) {
        data.slug = this.generateSlug(data.titulo)
      }

      // Si se publica, setear fecha de publicación
      const publishedAt = data.publicado 
        ? (data.publishedAt ? DateTime.fromISO(data.publishedAt) : DateTime.now())
        : null

      const post = await SalonPost.create({
        ...data,
        publishedAt,
      })

      await post.refresh()
      await post.load('espacio')

      return response.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        data: post,
      })
    } catch (error) {
      console.error('Error al crear post:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al crear el post',
        error: error.message,
      })
    }
  }

  /**
   * Obtener un post por ID (admin)
   * GET /admin/salon-posts/:id
   */
  async showAdmin({ params, response }: HttpContext) {
    try {
      // Validar que el ID sea un número válido
      const id = parseInt(params.id)
      if (isNaN(id) || id <= 0) {
        return response.status(400).json({
          success: false,
          message: 'ID de post inválido',
        })
      }

      const post = await SalonPost.query()
        .where('id', id)
        .preload('espacio')
        .first()

      if (!post) {
        return response.status(404).json({
          success: false,
          message: 'Post no encontrado',
        })
      }

      return response.json({
        success: true,
        data: post,
      })
    } catch (error) {
      console.error('Error al obtener post (admin):', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener el post',
      })
    }
  }

  /**
   * Actualizar un post (admin)
   * PUT /admin/salon-posts/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      // Validar que el ID sea un número válido
      const id = parseInt(params.id)
      if (isNaN(id) || id <= 0) {
        return response.status(400).json({
          success: false,
          message: 'ID de post inválido',
        })
      }

      const post = await SalonPost.find(id)

      if (!post) {
        return response.status(404).json({
          success: false,
          message: 'Post no encontrado',
        })
      }

      const data = request.only([
        'espacioId',
        'titulo',
        'content',
        'imagenes',
        'publicado',
      ])

      // Auto-generar slug del título
      if (data.titulo) {
        data.slug = data.titulo
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      // Si se publica por primera vez, setear fecha de publicación
      if (data.publicado && !post.publicado) {
        post.publishedAt = DateTime.now()
      }

      post.merge(data)
      await post.save()

      await post.refresh()
      await post.load('espacio')

      return response.json({
        success: true,
        message: 'Post actualizado exitosamente',
        data: post,
      })
    } catch (error) {
      console.error('Error al actualizar post:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al actualizar el post',
        error: error.message,
      })
    }
  }

  /**
   * Eliminar un post (admin)
   * DELETE /admin/salon-posts/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      // Validar que el ID sea un número válido
      const id = parseInt(params.id)
      if (isNaN(id) || id <= 0) {
        return response.status(400).json({
          success: false,
          message: 'ID de post inválido',
        })
      }

      const post = await SalonPost.find(id)

      if (!post) {
        return response.status(404).json({
          success: false,
          message: 'Post no encontrado',
        })
      }

      await post.delete()

      return response.json({
        success: true,
        message: 'Post eliminado exitosamente',
      })
    } catch (error) {
      console.error('Error al eliminar post:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al eliminar el post',
      })
    }
  }

  /**
   * Publicar/Despublicar un post (admin)
   * POST /admin/salon-posts/:id/publish
   */
  async publish({ params, request, response }: HttpContext) {
    try {
      // Validar que el ID sea un número válido
      const id = parseInt(params.id)
      if (isNaN(id) || id <= 0) {
        return response.status(400).json({
          success: false,
          message: 'ID de post inválido',
        })
      }

      const post = await SalonPost.find(id)

      if (!post) {
        return response.status(404).json({
          success: false,
          message: 'Post no encontrado',
        })
      }

      const { publicado } = request.only(['publicado'])
      
      post.publicado = publicado ?? !post.publicado
      
      // Setear fecha de publicación si se publica
      if (post.publicado && !post.publishedAt) {
        post.publishedAt = DateTime.now()
      }

      await post.save()

      // Opcional: hacer cache warming llamando a la URL pública
      // (descomentar si quieres calentar la cache del CDN)
      // try {
      //   const publicUrl = `${process.env.FRONTEND_URL}/salones/blog/${post.slug}`
      //   await fetch(publicUrl, { method: 'GET' })
      // } catch {}

      return response.json({
        success: true,
        message: post.publicado ? 'Post publicado' : 'Post despublicado',
        data: post,
      })
    } catch (error) {
      console.error('Error al publicar post:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al publicar el post',
      })
    }
  }

  /**
   * Genera un slug a partir del título
   */
  private generateSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo alfanuméricos y espacios
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim()
  }
}
