import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    username: schema.string({}, [
      rules.unique({ table: 'users', column: 'username', caseInsensitive: true }),
      rules.maxLength(20),
      rules.trim(),
    ]),
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
    ]),
    password: schema.string([
      rules.confirmed(),
      rules.minLength(4),
      rules.maxLength(10),
      rules.alphaNum(),
    ]),
  })

  public messages: CustomMessages = {}
}
