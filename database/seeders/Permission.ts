import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Permission from 'App/Models/Permission'

export default class extends BaseSeeder {
  public async run() {
    await Permission.createMany([
      /******** permission *******/
      {
        name: 'permission_list',
        description: 'View all permissions',
      },
      {
        name: 'permission_view',
        description: 'View permission',
      },
      {
        name: 'permission_create',
        description: 'Create New permission',
      },
      {
        name: 'permission_update',
        description: 'Update permission',
      },
      {
        name: 'permission_delete',
        description: 'Delete permission',
      },
      {
        name: 'permission_forceDelete',
        description: 'Delete permission',
      },
      /******** roles *******/
      {
        name: 'role_list',
        description: 'View all roles',
      },
      {
        name: 'role_view',
        description: 'View role',
      },
      {
        name: 'role_create',
        description: 'Create New role',
      },
      {
        name: 'role_update',
        description: 'Update role',
      },
      {
        name: 'role_delete',
        description: 'Delete User',
      },
      {
        name: 'role_forceDelete',
        description: 'Delete role',
      },
      /******** user *******/
      {
        name: 'user_list',
        description: 'View all Users',
      },
      {
        name: 'user_view',
        description: 'View Users',
      },
      {
        name: 'user_create',
        description: 'Create New User',
      },
      {
        name: 'user_update',
        description: 'Update User',
      },
      {
        name: 'user_delete',
        description: 'Delete User',
      },
      {
        name: 'user_forceDelete',
        description: 'Delete User',
      },
    ])
  }
}
