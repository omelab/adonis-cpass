import {
  column,
  BaseModel,
  belongsTo,
  BelongsTo,
  SnakeCaseNamingStrategy,
} from '@ioc:Adonis/Lucid/Orm'

import User from 'App/Models/User'
import Permission from 'App/Models/Permission'
import { DateTime } from 'luxon'
import moment from 'moment'

export default class UserPermission extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static primaryKey = 'id'
  public static table = 'user_permissions'
  public static selfAssignPrimaryKey = false

  @column({
    isPrimary: true,
  })
  public id: number

  @column({})
  public user_id: number

  @column({})
  public permission_id: number

  @column({
    serialize: (value: DateTime | null) => {
      return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : value
    },
  })
  public created_at: DateTime

  @column({
    serialize: (value: DateTime | null) => {
      return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : value
    },
  })
  public updated_at: DateTime

  public static boot() {
    super.boot()

    this.before('create', async (_modelInstance) => {
      _modelInstance.created_at = this.formatDateTime(_modelInstance.created_at)
      _modelInstance.updated_at = this.formatDateTime(false)
    })
    this.before('update', async (_modelInstance) => {
      _modelInstance.created_at = this.formatDateTime(_modelInstance.created_at)
      _modelInstance.updated_at = this.formatDateTime(new Date())
    })
  }

  private static formatDateTime(datetime: any = false) {
    if (datetime == false) {
      return null
    }
    let value = new Date(datetime)
    return datetime
      ? value.getFullYear() +
          '-' +
          (value.getMonth() + 1) +
          '-' +
          value.getDate() +
          ' ' +
          value.getHours() +
          ':' +
          value.getMinutes() +
          ':' +
          value.getSeconds()
      : datetime
  }

  private static formatDate(datetime: any) {
    let value = new Date(datetime)
    return datetime
      ? value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate()
      : datetime
  }

  public static allowedRelationships(): Array<string> {
    return []
  }

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Permission)
  public permission: BelongsTo<typeof Permission>
}
