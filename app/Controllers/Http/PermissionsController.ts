import Permission from 'App/Models/Permission'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class PermissionsController {
  //get all roles
  public async index({}: HttpContextContract) {
    const permissions = await Permission.query()
    return permissions
  }

  //single role
  public async show({ params }: HttpContextContract) {
    try {
      const permission = await Permission.find(params.id)
      if (permission) {
        return permission
      }
    } catch (error) {
      console.log(error)
    }
  }

  //Store Permission
  public async store({ request, response }: HttpContextContract) {
    const newPermissionSchema = schema.create({
      name: schema.string({}, [
        rules.unique({
          table: 'permissions',
          column: 'name',
        }),
      ]),
      description: schema.string([rules.trim()]),
    })

    const payload = await request.validate({ schema: newPermissionSchema })
    const permission = new Permission()
    permission.merge(payload)

    try {
      await permission.save()
      return response.send(permission)
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  //update Permission
  public async update({ request, params, response }: HttpContextContract) {
    const updateRoleSchema = schema.create({
      name: schema.string({}, [
        rules.unique({
          table: 'permissions',
          column: 'name',
          whereNot: { id: params.id },
        }),
      ]),
      description: schema.string([rules.trim()]),
    })

    const payload = await request.validate({ schema: updateRoleSchema })
    const permission = await Permission.find(params.id)

    if (permission) {
      permission.merge(payload)

      if (await permission.save()) {
        return response.send(permission)
      }
      return // 422
    }
    return // 401
  }

  //delete Permission
  public async destroy({ response, params }: HttpContextContract) {
    const permission = await Permission.find(params.id)
    permission?.related('roles').detach()

    try {
      await permission!.delete()
      return response.status(200)
    } catch (error) {
      console.log(error)
    }
  }
}
