import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  const specUrl = '/swagger.json'
  return view.render('swagger', { specUrl })
})
