import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'

export default class extends BaseSeeder {
  public async run() {
    const role = await Role.create({
      name: 'Super Admin',
      description: 'this is Super admin role',
    })
    const permissions = await Permission.query().then((row: any[]) =>
      row.map((object) => object.id)
    )
    await role.related('permissions').sync(permissions)
  }
}
