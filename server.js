const http = require('http')
const fs = require('fs')
const path = require('path')

const getFilePath = url => (url === '/' ? './index.html' : '.' + url)
const getContentType = extname => {
  switch (extname) {
    case '.html':
      return 'text/html'
    case '.js':
      return 'text/javascript'
    case '.css':
      return 'text/css'
    case '.json':
      return 'application/json'
    case '.png':
      return 'image/png'
    case '.jpg':
      return 'image/jpg'
    default:
      return 'application/octet-stream'
  }
}

http
  .createServer((request, response) => {
    const filePath = getFilePath(request.url)

    fs.readFile(filePath, function(error, content) {
      if (error) {
        if (error.code == 'ENOENT') {
          response.writeHead(404, { 'Content-Type': 'text/plain' })
          response.end('404', 'utf-8')
        } else {
          response.writeHead(500, { 'Content-Type': 'text/plain' })
          response.end('Sorry, ' + error.code)
        }
      } else {
        response.writeHead(200, {
          'Content-Type': getContentType(path.extname(filePath))
        })
        response.end(content, 'utf-8')
      }
    })
  })
  .listen(8080)

console.log('Server running at http://127.0.0.1:8080/')
