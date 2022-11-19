import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { PostStatus } from 'Contracts/enums'
export default class extends BaseSchema {
  protected tableName = 'posts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 255).notNullable()
      table.string('slug', 255).notNullable()
      table.text('excerpt').nullable()
      table.text('details').notNullable()
      table.string('feature_img', 255).nullable()
      table.string('feature_alt', 255).nullable()
      table.string('thumbnail_img', 255).nullable()
      table.string('thumbnail_alt', 255).nullable()
      table
        .integer('category_id')
        .unsigned()
        .references('categories.id')
        .onDelete('CASCADE')
        .nullable()
      table.enum('status', Object.values(PostStatus)).defaultTo(PostStatus.DRAFT).notNullable()
      table
        .integer('created_by')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
        .notNullable()
      table.integer('updated_by').unsigned().references('users.id').onDelete('CASCADE').nullable()
      table.integer('author_id').unsigned().references('authors.id').onDelete('CASCADE').nullable()

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
