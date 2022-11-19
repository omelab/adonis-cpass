import {
  column,
  BaseModel,
  belongsTo,
  BelongsTo,
  SnakeCaseNamingStrategy,
} from '@ioc:Adonis/Lucid/Orm'

import { DateTime } from 'luxon'
import moment from 'moment'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'

export default class RolePermission extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static primaryKey = 'id'
  public static table = 'role_permissions'
  public static selfAssignPrimaryKey = false

  @column({
    isPrimary: true,
  })
  public id: number

  @column({})
  public role_id: number

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

  @belongsTo(() => Role, {
    localKey: 'role_id',
  })
  public role: BelongsTo<typeof Role>

  @belongsTo(() => Permission, {
    localKey: 'permission_id',
  })
  public permission: BelongsTo<typeof Permission>
}
