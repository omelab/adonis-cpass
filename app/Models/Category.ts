import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import User from 'App/Models/User'
import { StatusEnum } from 'Contracts/enums'

export default class Category extends compose(BaseModel, SoftDeletes) {
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
  public details: string

  @column()
  public feature_img: string

  @column()
  public feature_alt: string

  @column()
  public status: StatusEnum

  @column()
  public created_by: number

  @column()
  public updated_by: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // set custom `deletedAt` column name
  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null

  // Relationship
  @belongsTo(() => User, {
    foreignKey: 'created_by', // defaults to userId
  })
  public creator: BelongsTo<typeof User>
}
