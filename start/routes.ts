import Route from '@ioc:Adonis/Core/Route'
import AuthRoute from 'Routes/Auth'
import 'Routes/Swagger'

Route.group(() => {
  //auth routes
  AuthRoute()

  Route.group(() => {
    //user
    Route.group(() => {
      Route.get('/profile', 'UsersController.profile')
      Route.get('/posts', 'UsersController.postsByUser')
    }).prefix('users')
    Route.resource('users', 'UsersController').apiOnly()

    //author routes
    Route.resource('authors', 'AuthorsController').apiOnly()

    //categories routes
    Route.resource('categories', 'CategoriesController').apiOnly()
    Route.get('/trash/categories', 'CategoriesController.trashedList')
    Route.put('/trash/categories/:id', 'CategoriesController.restore')
    Route.delete('/trash/categories/:id', 'CategoriesController.forceDestroy')

    //posts routes
    Route.resource('posts', 'PostsController').apiOnly()
    Route.get('/trash/posts', 'PostsController.trashedList')
    Route.put('/trash/posts/:id', 'PostsController.restore')
    Route.delete('/trash/posts/:id', 'PostsController.forceDestroy')
  }).middleware('auth:api')
}).prefix('api')
