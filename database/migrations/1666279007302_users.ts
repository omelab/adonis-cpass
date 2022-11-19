import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { StatusEnum } from 'Contracts/enums'
export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('username', 50).notNullable().unique()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.enum('status', Object.values(StatusEnum)).defaultTo(StatusEnum.ACTIVE).notNullable()

      table.integer('created_by').unsigned().references('users.id').onDelete('CASCADE').nullable()
      table.integer('updated_by').unsigned().references('users.id').onDelete('CASCADE').nullable()
      table.integer('deleted_by').unsigned().references('users.id').onDelete('CASCADE').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
