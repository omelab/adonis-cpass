import Route from '@ioc:Adonis/Core/Route'

const AuthRoute = () => {
  Route.group(() => {
    Route.post('register', 'AuthController.register')
    Route.post('login', 'AuthController.login')
  }).prefix('auth')

  Route.group(() => {
    Route.resource('roles', 'RolesController').apiOnly()
    Route.resource('permissions', 'PermissionsController').apiOnly()
  }).middleware('auth:api')
}
export default AuthRoute
