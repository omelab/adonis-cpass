import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class TestController {
  //Login users
  public async login({ auth, request, response }: HttpContextContract) {
    const userId = request.input('userId')
    const password = request.input('password')

    try {
      const token = await auth.use('api').attempt(userId, password, { expiresIn: '10 days' })
      return token.toJSON()
    } catch {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    // const token = await auth.use('api').attempt(userId, password, {
    //   expiresIn: '10 days',
    // })
    // return token.toJSON()
  }

  //register users
  public async register({ request, auth }: HttpContextContract) {
    // const payload = await request.validate({
    //   schema: schema.create({
    //     email: schema.string({ trim: true }, [rules.email()]),
    //     password: schema.string(),
    //     username: schema.string({ trim: true }, [rules.maxLength(4)]),
    //   }),
    // })

    const payload = await validator.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        username: schema.string({ trim: true }, [rules.maxLength(4)]),
      }),
      data: { request },
    })

    console.log(payload)

    const email = request.input('email')
    const password = request.input('password')
    const username = request.input('username')
    const newUser = new User()
    newUser.email = email
    newUser.password = password
    newUser.username = username
    await newUser.save()

    const token = await auth.use('api').login(newUser, {
      expiresIn: '10 days',
    })

    return token.toJSON()
  }
}
