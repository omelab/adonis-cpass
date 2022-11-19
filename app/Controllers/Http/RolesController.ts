import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Role from 'App/Models/Role'

export default class RolesController {
  //Get all roles
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const roles = await Role.query().preload('permissions').paginate(page, limit)
    return roles
  }

  //Single role
  public async show({ params }: HttpContextContract) {
    try {
      const role = await Role.find(params.id)
      if (role) {
        await role.preload('permissions')
        return role
      }
    } catch (error) {
      console.log(error)
    }
  }

  //Store role
  public async store({ request, response }: HttpContextContract) {
    const newRoleSchema = schema.create({
      name: schema.string({}, [
        rules.unique({
          table: 'roles',
          column: 'name',
        }),
      ]),
      description: schema.string([rules.trim()]),
      permissions: schema.array().members(schema.number()),
    })

    const payload = await request.validate({ schema: newRoleSchema })

    const role = new Role()
    role.merge(payload)

    try {
      if (await role.save()) {
        await role.related('permissions').sync(payload.permissions)
        await role.load('permissions')
        return response.send(role)
      }
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  //Update role
  public async update({ request, params, response }: HttpContextContract) {
    const updateRoleSchema = schema.create({
      name: schema.string({}, [
        rules.unique({
          table: 'roles',
          column: 'name',
          whereNot: { id: params.id },
        }),
      ]),
      description: schema.string([rules.trim()]),
      permissions: schema.array().members(schema.number()),
    })

    const payload = await request.validate({ schema: updateRoleSchema })
    const role = await Role.find(params.id)

    if (role) {
      role.merge(payload)

      if (await role.save()) {
        await role.related('permissions').sync(payload.permissions)
        await role.load('permissions')
        return response.send(role)
      }
      return // 422
    }
    return // 401
  }

  //Delete Role
  public async destroy({ response, params }: HttpContextContract) {
    const role = await Role.find(params.id)
    role?.related('permissions').detach()

    try {
      await role!.delete()
      return response.status(200)
    } catch (error) {
      console.log(error)
    }
  }
}
