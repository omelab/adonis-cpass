import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { StatusEnum } from 'Contracts/enums'

export default class extends BaseSchema {
  protected tableName = 'authors'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('picture', 255).nullable()
      table.text('biography').nullable()
      table.enum('status', Object.values(StatusEnum)).defaultTo(StatusEnum.ACTIVE).notNullable()
      // table.enu('status', ['Active', 'Inactive', 'Deleted']).defaultTo('Active')
      table
        .integer('created_by')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
        .notNullable()
      table.integer('updated_by').unsigned().references('users.id').onDelete('CASCADE').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
