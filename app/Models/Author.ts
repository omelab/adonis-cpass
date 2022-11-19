import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import User from 'App/Models/User'
import { StatusEnum } from 'Contracts/enums'

export default class Author extends compose(BaseModel, SoftDeletes) {
  withTrashed() {
    throw new Error('Method not implemented.')
  }
  query() {
    throw new Error('Method not implemented.')
  }
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public picture: string | null

  @column()
  public biography: string

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
