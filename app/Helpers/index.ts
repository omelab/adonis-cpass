import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'

//app url
export const app_url = Env.get('APP_URL')

export const removeTrailingSlash = (str: string) => {
  let text = str.startsWith('/') ? str.slice(1) : str
  return text.endsWith('/') ? text.slice(0, -1) : text
}

//get app url
export const getAppUrl = (url: string = '') => {
  return url != '' ? app_url + '/' + removeTrailingSlash(url) : app_url
}

//generate random file name
export const generateName = (extension: string) => {
  const d = new Date()
  return `${string.generateRandom(8)}${d.getTime()}.${extension}`
}
