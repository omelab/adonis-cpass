import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Category from 'App/Models/Category'
import { StatusEnum } from 'Contracts/enums'
import { getAppUrl, generateName } from 'App/Helpers'

export default class CategoriesController {
  /**
   * Get a list authors
   * GET /authors?withTrashed=1
   */
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const categoriesQuery = request.input('withTrashed') ? Category.withTrashed() : Category.query()
    return categoriesQuery.paginate(page, limit)
  }

  /**
   * store new Category
   * POST /categories
   */
  public async store({ auth, request, response }: HttpContextContract) {
    const newCategorySchema = schema.create({
      title: schema.string({}, [
        rules.trim(),
        rules.minLength(4),
        rules.maxLength(200),
        rules.unique({
          table: 'categories',
          column: 'title',
        }),
      ]),
      status: schema.enum(Object.values(StatusEnum)),
      details: schema.string({}),
    })

    const payload = await request.validate({ schema: newCategorySchema })
    const category = new Category()
    category.merge(payload)
    category.created_by = auth.user!.id

    const coverImage = request.file('feature_img', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (coverImage && !coverImage.isValid) {
      return coverImage.errors
    }

    if (coverImage && coverImage.isValid) {
      await coverImage.moveToDisk('./', {
        name: generateName(coverImage.extname ?? 'jpg'),
        overwrite: true, // overwrite in case of conflict
      })

      const url = await Drive.getUrl(coverImage.fileName ?? '')
      category.feature_img = getAppUrl(url)
      category.feature_alt = request.input('feature_alt') ?? request.input('title')
    }

    try {
      if (await category.save()) {
        return response.send(category)
      }
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  /**
   * Update categories by id
   * PUT /categories/:id
   */
  public async update({ auth, params, request, response }: HttpContextContract) {
    const category = await Category.withTrashed().where('id', params.id).firstOrFail()
    category.updated_by = auth.user!.id

    const updateAuthorSchema = schema.create({
      title: schema.string({}, [
        rules.trim(),
        rules.minLength(4),
        rules.maxLength(55),
        rules.unique({
          table: 'categories',
          column: 'title',
          whereNot: { id: params.id },
        }),
      ]),
      status: schema.enum(Object.values(StatusEnum)),
      details: schema.string({}),
    })

    const payload = await request.validate({ schema: updateAuthorSchema })
    category.merge(payload)

    const coverImage = request.file('feature_img', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (coverImage && !coverImage.isValid) {
      return coverImage.errors
    }

    if (coverImage && coverImage.isValid) {
      await coverImage.moveToDisk('./', {
        name: generateName(coverImage.extname ?? 'jpg'),
        overwrite: true, // overwrite in case of conflict
      })

      const url = await Drive.getUrl(coverImage.fileName ?? '')
      category.feature_img = getAppUrl(url)
      category.feature_alt = request.input('feature_alt') ?? request.input('title')
    }

    try {
      if (await category.save()) {
        return response.send(category)
      }
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  /**
   * Get category by id
   * GET /categories/:id
   */
  public async show({ params, response }: HttpContextContract) {
    const category = await Category.withTrashed().where('id', params.id).firstOrFail()

    if (category.trashed) {
      return response.forbidden()
    }
    return category
  }

  /**
   * Delete category by id
   * DELETE /categories/:id
   */
  public async destroy({ params, response }: HttpContextContract) {
    const category = await Category.findOrFail(params.id)
    await category.delete()
    return response.noContent()
  }

  /**
   * Force Delete author by id
   * DELETE /trash/categories/:id
   */
  public async forceDestroy({ params, response }: HttpContextContract) {
    const category = await Category.withTrashed().where('id', params.id).firstOrFail()
    await category.forceDelete()
    return response.noContent()
  }

  /**
   * Get a list trashed categories
   * GET /trash/categories
   */
  public async trashedList({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    return Category.onlyTrashed().paginate(page, limit)
  }

  /**
   * Restore trashed category by id
   * PUT /trash/categories/:id
   */
  public async restore({ params }: HttpContextContract) {
    const category = await Category.withTrashed().where('id', params.id).firstOrFail()
    await category.restore()
    return category

    // or
    //await Author.withTrashed().where('id', params.id).restore()
    //await Author.query().withTrashed().where('id', params.id).restore()
  }
}
