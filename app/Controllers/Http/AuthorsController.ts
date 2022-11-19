import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Author from 'App/Models/Author'
import { StatusEnum } from 'Contracts/enums'
import { getAppUrl, generateName } from 'App/Helpers'

export default class AuthorsController {
  /**
   * Get a list authors
   * GET /authors?withTrashed=1
   */
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const authorsQuery = request.input('withTrashed') ? Author.withTrashed() : Author.query()
    return authorsQuery.paginate(page, limit)

    // or
    // return Author.query()
    //   .if(request.input('withTrashed'), (query) => {
    //     query.withTrashed()
    //   })
    //   .exec()
  }

  /**
   * store new author
   * POST /authors
   */
  public async store({ auth, request, response }: HttpContextContract) {
    const newAuthorSchema = schema.create({
      name: schema.string([rules.trim(), rules.minLength(4), rules.maxLength(55)]),
      email: schema.string({}, [
        rules.unique({
          table: 'authors',
          column: 'email',
        }),
      ]),
      status: schema.enum(Object.values(StatusEnum)),
      biography: schema.string({}),
    })

    const payload = await request.validate({ schema: newAuthorSchema })
    const author = new Author()
    author.merge(payload)
    author.created_by = auth.user!.id

    const coverImage = request.file('picture', {
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
      author.picture = getAppUrl(url)
    }

    try {
      if (await author.save()) {
        return response.send(author)
      }
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  /**
   * Update author by id
   * PUT /authors/:id
   */
  public async update({ auth, params, request, response }: HttpContextContract) {
    const author = await Author.withTrashed().where('id', params.id).firstOrFail()
    author.updated_by = auth.user!.id

    const updateAuthorSchema = schema.create({
      name: schema.string([rules.trim(), rules.minLength(4), rules.maxLength(55)]),
      email: schema.string({}, [
        rules.unique({
          table: 'authors',
          column: 'email',
          whereNot: { id: params.id },
        }),
      ]),
      status: schema.enum(Object.values(StatusEnum)),
      biography: schema.string({}),
    })

    const payload = await request.validate({ schema: updateAuthorSchema })
    author.merge(payload)

    const coverImage = request.file('picture', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (coverImage && !coverImage.isValid) {
      return coverImage.errors
    }

    if (coverImage && coverImage.isValid) {
      await coverImage.moveToDisk('./', {
        name: generateName(coverImage.extname ?? ''),
        overwrite: true,
      })

      const url = await Drive.getUrl(coverImage.fileName ?? '')
      author.picture = getAppUrl(url)
    }

    try {
      if (await author.save()) {
        return response.send(author)
      }
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  /**
   * Get author by id
   * GET /authors/:id
   */
  public async show({ params, response }: HttpContextContract) {
    const author = await Author.withTrashed().where('id', params.id).firstOrFail()

    if (author.trashed) {
      return response.forbidden()
    }
    return author
  }

  /**
   * Delete author by id
   * DELETE /authors/:id
   */
  public async destroy({ params, response }: HttpContextContract) {
    const author = await Author.findOrFail(params.id)
    await author.delete()
    return response.noContent()
  }

  /**
   * Force Delete author by id
   * DELETE /authors/:id
   */
  public async forceDestroy({ params, response }: HttpContextContract) {
    const author = await Author.withTrashed().where('id', params.id).firstOrFail()
    await author.forceDelete()
    return response.noContent()
  }

  /**
   * Get a list trashed authors
   * GET /trash/authors
   */
  public async trashedList({}: HttpContextContract) {
    return Author.onlyTrashed().exec()
  }

  /**
   * Restore trashed author by id
   * PUT /trash/authors/:id
   */
  public async restore({ params }: HttpContextContract) {
    const author = await Author.withTrashed().where('id', params.id).firstOrFail()
    await author.restore()
    return author

    // or
    //await Author.withTrashed().where('id', params.id).restore()
    //await Author.query().withTrashed().where('id', params.id).restore()
  }
}
