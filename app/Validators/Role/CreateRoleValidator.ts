import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateRoleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}, [
      rules.unique({ table: 'roles', column: 'name', caseInsensitive: true }),
      rules.maxLength(20),
      rules.trim(),
    ]),
    description: schema.string([rules.trim()]),
  })

  public messages: CustomMessages = {}
}
