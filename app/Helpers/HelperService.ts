import Env from '@ioc:Adonis/Core/Env'

export class HelperService {
  //application url
  static app_url: string = Env.get('APP_URL')

  //get concat application url
  static getAppUrl(url: string = ''): string {
    return url != '' ? this.app_url + '/' + url : this.app_url
  }
}
