import {
  column,
  BaseModel,
  manyToMany,
  SnakeCaseNamingStrategy,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'

import { DateTime } from 'luxon'
import moment from 'moment'
import Permission from 'App/Models/Permission'
// import Permission from 'App/Models/RolePermission'

export default class Role extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static primaryKey = 'id'
  public static table = 'roles'
  public static selfAssignPrimaryKey = false

  @column({
    isPrimary: true,
  })
  public id: number

  @column({})
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name'],
  })
  public slug: string

  @column({})
  public name: string

  @column({})
  public description: string

  @column({
    serialize: (value: DateTime | null) => {
      // return value ? moment(value).format('lll') : value
      return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : value
    },
  })
  public created_at: DateTime

  @column({
    serialize: (value: DateTime | null) => {
      // return value ? moment(value).format('lll') : value
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

  @manyToMany(() => Permission, {
    pivotColumns: ['permission_id'],
    pivotTable: 'role_permissions',
  })
  public permissions: ManyToMany<typeof Permission>
}
