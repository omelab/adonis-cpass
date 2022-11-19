import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterUser from 'App/Validators/RegisterUserValidator'
import Database from '@ioc:Adonis/Lucid/Database'

import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  //basic Login users
  public async login({ auth, request, response }: HttpContextContract) {
    const userId = request.input('userId')
    const password = request.input('password')

    // Lookup user manually
    const user = await User.query()
      .where((query) => {
        query.where('email', userId)
        query.orWhere('username', userId)
      })
      .where('status', 'Active')
      .whereNull('deleted_at')
      .firstOrFail()

    // Verify password
    if (!(await Hash.verify(user.password, password))) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    // Generate token
    try {
      //remove old tokens
      await Database.from('api_tokens').where('user_id', user.id).delete()

      //generate new tokens
      const token = await auth.use('api').generate(user)
      return response.send(token)
    } catch {
      //return error response
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  //register users
  public async register({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterUser)

    const user = new User()
    user.merge(payload)

    try {
      await user.save()
      const token = await auth.use('api').login(user)
      return response.send(token)
    } catch (error) {
      return response.send(error)
    }
  }
}
