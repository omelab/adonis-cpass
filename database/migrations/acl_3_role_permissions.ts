import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Config from '@ioc:Adonis/Core/Config'

export default class RolePermissions extends BaseSchema {
  protected tableName = Config.get('rolePermission.role_permission_table', 'role_permissions')

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('role_id')
        .unsigned()
        .references('id')
        .inTable(Config.get('rolePermission.role_table', 'roles'))
      table
        .integer('permission_id')
        .unsigned()
        .references('id')
        .inTable(Config.get('rolePermission.permission_table', 'permissions'))

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      // table.timestamp('created_at', { useTz: true }).nullable()
      // table.timestamp('updated_at', { useTz: true }).nullable()

      table.timestamp('created_at', { precision: 3 }).defaultTo(this.raw('NOW(3)'))
      table
        .timestamp('updated_at', { precision: 3 })
        .defaultTo(this.raw('NOW(3) ON UPDATE NOW(3)'))
        .nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
