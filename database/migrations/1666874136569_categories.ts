import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { StatusEnum } from 'Contracts/enums'
export default class extends BaseSchema {
  protected tableName = 'categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 255).notNullable()
      table.string('slug', 255).notNullable()
      table.text('details').notNullable()
      table.string('feature_img', 255).nullable()
      table.string('feature_alt', 255).nullable()
      table.enum('status', Object.values(StatusEnum)).defaultTo(StatusEnum.ACTIVE).notNullable()
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
