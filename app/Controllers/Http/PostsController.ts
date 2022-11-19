import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Post from 'App/Models/Post'
import { PostStatus } from 'Contracts/enums'
import { getAppUrl, generateName } from 'App/Helpers'

export default class PostsController {
  /**
   * Get a list authors
   * GET /authors?withTrashed=1
   */
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const postsQuery = request.input('withTrashed') ? Post.withTrashed() : Post.query()
    await postsQuery.preload('author')
    return postsQuery.paginate(page, limit)
  }

  /**
   * store new post
   * POST /posts
   */
  public async store({ auth, request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      title: schema.string({}, [rules.trim(), rules.minLength(4), rules.maxLength(200)]),
      details: schema.string({}),
      excerpt: schema.string({}),
      category_id: schema.number(),
      author_id: schema.number(),
      status: schema.enum(Object.values(PostStatus)),
    })

    const payload = await request.validate({ schema: newPostSchema })

    const post = new Post()
    post.merge(payload)
    post.created_by = auth.user!.id

    const featureImg = request.file('feature_img', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (featureImg && !featureImg.isValid) {
      return featureImg.errors
    }

    if (featureImg && featureImg.isValid) {
      await featureImg.moveToDisk('./', {
        name: generateName(featureImg.extname ?? 'jpg'),
        overwrite: true, // overwrite in case of conflict
      })

      const url = await Drive.getUrl(featureImg.fileName ?? '')
      post.feature_img = getAppUrl(url)
      post.feature_alt = request.input('feature_alt') ?? request.input('title')
    }

    const thumbnailImg = request.file('thumbnail_img', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (thumbnailImg && !thumbnailImg.isValid) {
      return thumbnailImg.errors
    }

    if (thumbnailImg && thumbnailImg.isValid) {
      await thumbnailImg.moveToDisk('./', {
        name: generateName(thumbnailImg.extname ?? 'jpg'),
        overwrite: true, // overwrite in case of conflict
      })

      const turl = await Drive.getUrl(thumbnailImg.fileName ?? '')
      post.thumbnail_img = getAppUrl(turl)
      post.thumbnail_alt = request.input('thumbnail_alt') ?? request.input('title')
    }

    try {
      if (await post.save()) {
        return response.send(post)
      }
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  /**
   * Update post by id
   * PUT /posts/:id
   */
  public async update({ auth, params, request, response }: HttpContextContract) {
    const post = await Post.withTrashed().where('id', params.id).firstOrFail()
    post.updated_by = auth.user!.id

    const updatePostSchema = schema.create({
      title: schema.string({}, [rules.trim(), rules.minLength(4), rules.maxLength(200)]),
      details: schema.string({}),
      excerpt: schema.string({}),
      category_id: schema.number(),
      author_id: schema.number(),
      status: schema.enum(Object.values(PostStatus)),
    })

    const payload = await request.validate({ schema: updatePostSchema })
    post.feature_alt = request.input('feature_alt') ?? ''
    post.thumbnail_alt = request.input('thumbnail_alt') ?? ''
    post.merge(payload)

    const featureImg = request.file('feature_img', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (featureImg && !featureImg.isValid) {
      return featureImg.errors
    }

    if (featureImg && featureImg.isValid) {
      await featureImg.moveToDisk('./', {
        name: generateName(featureImg.extname ?? 'jpg'),
        overwrite: true, // overwrite in case of conflict
      })

      const url = await Drive.getUrl(featureImg.fileName ?? '')
      post.feature_img = getAppUrl(url)
    }

    const thumbnailImg = request.file('thumbnail_img', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (thumbnailImg && !thumbnailImg.isValid) {
      return thumbnailImg.errors
    }

    if (thumbnailImg && thumbnailImg.isValid) {
      await thumbnailImg.moveToDisk('./', {
        name: generateName(thumbnailImg.extname ?? 'jpg'),
        overwrite: true, // overwrite in case of conflict
      })

      const turl = await Drive.getUrl(thumbnailImg.fileName ?? '')
      post.thumbnail_img = getAppUrl(turl)
    }

    try {
      if (await post.save()) {
        return response.send(post)
      }
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  /**
   * Get post by id
   * GET /posts/:id
   */
  public async show({ params, response }: HttpContextContract) {
    const post = await Post.withTrashed().where('id', params.id).firstOrFail()
    await post.load('author')

    if (post.trashed) {
      return response.forbidden()
    }

    return post
  }

  /**
   * Delete post by id
   * DELETE /posts/:id
   */
  public async destroy({ params, response }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)
    await post.delete()
    return response.noContent()
  }

  /**
   * Force Delete author by id
   * DELETE /trash/posts/:id
   */
  public async forceDestroy({ params, response }: HttpContextContract) {
    const post = await Post.withTrashed().where('id', params.id).firstOrFail()
    await post.forceDelete()
    return response.noContent()
  }

  /**
   * Get a list trashed posts
   * GET /trash/posts
   */
  public async trashedList({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    return Post.onlyTrashed().paginate(page, limit)
  }

  /**
   * Restore trashed post by id
   * PUT /trash/posts/:id
   */
  public async restore({ params }: HttpContextContract) {
    const post = await Post.withTrashed().where('id', params.id).firstOrFail()
    await post.restore()
    return post
  }
}
