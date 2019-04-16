const Koa = require('koa')
const serve = require('koa-static')
var Router = require('koa-router')
const app = new Koa()
var router = new Router()

router.get('/302', (ctx, next) => {
    ctx.status = 302
    // ctx.body =  {
    //     location: '/302.html'
    // }
    ctx.redirect('/302.html')
    next()
})

app.use(router.routes())
   .use(router.allowedMethods())
   .use(serve('public'))

app.listen(3000)
console.log('Server on port 3000 ...');