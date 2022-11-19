import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Profile from 'App/Models/Profile'
import { StatusEnum } from 'Contracts/enums'

export default class extends BaseSeeder {
  public async run() {
    //create user
    const user = await User.create({
      username: 'admin',
      email: 'admin@adonisjs.com',
      password: '123456',
      status: StatusEnum.ACTIVE,
      created_by: 1,
    })

    //create profile
    const profile = await Profile.create({
      full_name: 'Administrator',
      mobile: 123456789,
      address: 'Dhaka, Bangladesh',
      zip_code: '1205',
      avatar_url: 'https://images.unsplash.com/5/unsplash-kitsune-4.jpg',
    })

    //sync with user and profile
    await profile.related('user').associate(user)

    //set roles
    await user.related('roles').sync([1])

    //get permissons
    const permissionArray = await Database.from('role_permissions')
      .where('role_id', 1)
      .then((row: any[]) => row.map((object) => object.permission_id))

    //set permissons
    await user.related('permissions').sync(permissionArray)
  }
}
