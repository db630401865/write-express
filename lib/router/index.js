const url = require('url')
const methods = require('methods')
// pathRegexp 处理动态路由参数
const Layer = require('./layer')
const Route = require('./route')

function Router() {
  this.stack = []
}

methods.forEach(method => {
  Router.prototype[method] = function (path, handlers) {
    const route = new Route()
    const layer = new Layer(path, route.dispatch.bind(route))
    layer.route = route
    this.stack.push(layer)
    route[method](path, handlers)
  }
})   

Router.prototype.handler = function (req, res) {
    const { pathname } = url.parse(req.url)
    const method = req.method.toLowerCase()

    let index = 0
    const next = () => {
      if(index>= this.stack.length){
        return res.end(`can not get ${pathname}`)
      }

      const layer = this.stack[index++]
      const match = layer.match(pathname)
      if(match){
        req.params = req.params || {}
        Object.assign(req.params, layer.params)
      }

      // 顶层只判定请求路径，内层判定请求方法
      if(match){
        // 顶层这里调用的handler其实就是dispath 函数
        return layer.handler(req, res, next)
      }
      next()
    }

    next()
}


Router.prototype.use = function(path, haundlers){
  if(typeof path === 'function'){
    haundlers.unshift(path) // 处理函数
    path = '/' // 任何路径都以它开头 
  }
  haundlers.forEach( haundler =>{
    const layer = new Layer(path, haundler)
    layer.isUseMiddleware = true
    this.stack.push(layer)

  })
}

module.exports = Router