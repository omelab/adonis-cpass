import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Config from '@ioc:Adonis/Core/Config'

export default class Permissions extends BaseSchema {
  protected tableName = Config.get('rolePermission.permission_table', 'permissions')

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 191).unique()
      table.string('slug', 191).nullable().unique()
      table.string('description', 191).nullable()

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
