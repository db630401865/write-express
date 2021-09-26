// pathRegexp 处理动态路由参数
const pathRegexp = require('path-to-regexp')

function Layer(path, handler) {
  this.path = path
  this.handler = handler
  this.keys = []
  this.regexp = pathRegexp(path, this.keys, [])
  this.params = {}
  this.isUseMiddleware = false
}
 
Layer.prototype.match = function (pathname) {
  const match = this.regexp.exec(pathname) // 对路径进行匹配以及路径分组 ==== route.path === pathname
  if(match){
    this.keys.forEach(( key, index) =>{
      this.params[key.name] = match[index + 1]
    })

    return true
  }

  if(this.isUseMiddleware){
    if(this.path === '/'){
      return true
    }
  
    if(pathname.startsWith(`${this.path}/`)){
      return true
    }
  }

  return false
}

module.exports = Layer