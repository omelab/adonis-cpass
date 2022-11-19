import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Author from 'App/Models/Author'

import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import { PostStatus } from 'Contracts/enums'

export default class Post extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['title'],
  })
  public slug: string

  @column()
  public title: string

  @column()
  public excerpt: string

  @column()
  public details: string

  @column()
  public feature_img: string

  @column()
  public feature_alt: string

  @column()
  public thumbnail_img: string

  @column()
  public thumbnail_alt: string

  @column()
  public category_id: number

  @column()
  public created_by: number

  @column()
  public updated_by: number

  @column()
  public author_id: number

  @column()
  public status: PostStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null

  // Relationship
  @belongsTo(() => User, {
    foreignKey: 'created_by', // defaults to userId
  })
  public creator: BelongsTo<typeof User>

  // Relationship
  @belongsTo(() => Author, {
    foreignKey: 'author_id',
  })
  public author: BelongsTo<typeof Author>
}
