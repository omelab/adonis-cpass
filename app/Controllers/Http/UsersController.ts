import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Drive from '@ioc:Adonis/Core/Drive'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { StatusEnum } from 'Contracts/enums'
import { getAppUrl, generateName } from 'App/Helpers'

import User from 'App/Models/User'
import Profile from 'App/Models/Profile'

export default class UsersController {
  //User list
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const usersQuery = request.input('withTrashed') ? User.withTrashed() : User.query()
    return usersQuery.preload('profile').paginate(page, limit)
  }

  //User Profile
  public async profile({ auth, response }: HttpContextContract) {
    if (!auth.isLoggedIn) {
      return response.status(401).send('Unauthenticated')
    }

    try {
      const user = await User.query().where('id', auth.user!.id).firstOrFail()
      await user.load('profile')

      response.send(user)
    } catch (error) {
      console.log(error)
    }
  }

  //single users
  public async show({ params, response }: HttpContextContract) {
    const user = await User.withTrashed().where('id', params!.id).firstOrFail()
    await user.load('profile')

    if (user.trashed) {
      return response.forbidden()
    }

    return user
  }

  //create new user
  public async store({ auth, request, response }: HttpContextContract) {
    const newUserSchema = schema.create({
      username: schema.string({ trim: true }, [
        rules.unique({ table: 'users', column: 'username', caseInsensitive: true }),
        rules.maxLength(20),
        rules.trim(),
      ]),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
      ]),
      password: schema.string([
        rules.confirmed(),
        rules.minLength(4),
        rules.maxLength(10),
        rules.alphaNum(),
      ]),
      status: schema.enum(Object.values(StatusEnum)),
      roles: schema.array().members(schema.number()),
    })

    const profileSchema = schema.create({
      full_name: schema.string.nullableAndOptional(),
      mobile: schema.number.nullableAndOptional(),
      address: schema.string.nullableAndOptional(),
      zip_code: schema.string.nullableAndOptional(),
    })

    //validate request fields
    const payload = await request.validate({ schema: newUserSchema })

    const profilePayload = await request.validate({ schema: profileSchema })

    //validate prifile picture
    const coverImage = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (coverImage && !coverImage.isValid) {
      return coverImage.errors
    }

    //create user
    const user = new User()
    user.merge(payload)
    user.created_by = auth.user!.id

    if (await user.save()) {
      //create profile by user
      const profile = new Profile()
      profile.merge(profilePayload)

      if (coverImage && coverImage.isValid) {
        await coverImage.moveToDisk('./', {
          name: generateName(coverImage.extname ?? 'jpg'),
          overwrite: true, // overwrite in case of conflict
        })
        const url = await Drive.getUrl(coverImage.fileName ?? '')
        profile.avatar_url = getAppUrl(url)
      }

      await profile.related('user').associate(user)

      if (payload.roles && payload.roles.length > 0) {
        //set roles
        await user.related('roles').sync(payload.roles)

        //get permissons
        const permissionArray = await Database.from('role_permissions')
          .whereIn('role_id', payload.roles)
          .then((row: any[]) => row.map((object) => object.permission_id))

        //set permissons
        await user.related('permissions').sync(permissionArray)
      }

      //get updated ursers
      const responseUer = await User.query()
        .preload('profile')
        .preload('roles')
        .preload('permissions')
        .where('id', user.id)
      return response.send(responseUer)
    }

    return response.status(400).send({ message: 'Invalid Request' })
  }

  /**
   * Update users by id
   * PUT /users/:id
   */
  public async update({ auth, params, request, response }: HttpContextContract) {
    const user = await User.withTrashed().where('id', params.id).preload('profile').firstOrFail()
    user.updated_by = auth.user!.id

    const updateUserSchema = schema.create({
      username: schema.string({ trim: true }, [
        rules.unique({
          table: 'users',
          column: 'username',
          caseInsensitive: true,
          whereNot: { id: params.id },
        }),
        rules.maxLength(20),
        rules.trim(),
      ]),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({
          table: 'users',
          column: 'email',
          caseInsensitive: true,
          whereNot: { id: params.id },
        }),
      ]),
      password: schema.string([
        rules.confirmed(),
        rules.minLength(4),
        rules.maxLength(10),
        rules.alphaNum(),
      ]),
      status: schema.enum(Object.values(StatusEnum)),
      roles: schema.array().members(schema.number()),
    })

    const profileSchema = schema.create({
      full_name: schema.string.nullableAndOptional(),
      mobile: schema.number.nullableAndOptional(),
      address: schema.string.nullableAndOptional(),
      zip_code: schema.string.nullableAndOptional(),
    })

    //validate request fields
    const payload = await request.validate({ schema: updateUserSchema })
    user.merge(payload)

    const profilePayload = await request.validate({ schema: profileSchema })

    //validate prifile picture
    const coverImage = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'png', 'gif', 'webp'],
    })

    if (coverImage && !coverImage.isValid) {
      return coverImage.errors
    }

    if (await user.save()) {
      //create profile by user
      const profile = await Profile.findOrFail(user!.profile!.id)
      profile.merge(profilePayload)

      if (coverImage && coverImage.isValid) {
        await coverImage.moveToDisk('./', {
          name: generateName(coverImage.extname ?? 'jpg'),
          overwrite: true, // overwrite in case of conflict
        })
        const url = await Drive.getUrl(coverImage.fileName ?? '')
        profile.avatar_url = getAppUrl(url)
      }
      await profile.related('user').associate(user)

      if (payload.roles && payload.roles.length > 0) {
        //set roles
        await user.related('roles').sync(payload.roles)

        //get permissons
        const permissionArray = await Database.from('role_permissions')
          .whereIn('role_id', payload.roles)
          .then((row: any[]) => row.map((object) => object.permission_id))

        //set permissons
        await user.related('permissions').sync(permissionArray)
      }

      //get updated ursers
      const responseUer = await User.query()
        .preload('profile')
        .preload('roles')
        .preload('permissions')
        .where('id', user.id)
      return response.send(responseUer)
    }

    return response.status(400).send({ message: 'Invalid Request' })
  }
}
