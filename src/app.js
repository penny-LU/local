const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const { sequelize } = require('./models')
// const config = require('./config/config')
const net = require('net')
// const { createProxyMiddleware } = require('http-proxy-middleware') // 这个依赖的版本为1.0以上写法

const port = 8124
const host = '127.0.0.1'

// const path = require('path')
// const API_SERVICE_URL = 'https://backend20221130.azurewebsites.net'
const socketList = []
console.log('wait for connection...')
const sock = net.createServer()

sock.on('listening', () => {
  console.log(`服务端已经开启，地址：${host}:${port}`)
})
sock.listen(port, host)

sock.on('connection', socket => {
  // Put this new client in the list
  socket.setEncoding('utf8')
  console.log('Connection' + socket.remoteAddress + ':' + socket.remotePort)
  // const name = socket.remoteAddress + ':' + socket.remotePort
  socketList.push(socket)

  socket.on('error', function (err) { // 连接断开
    console.log('客户端異常退出！' + err.message)
  })
  socket.on('close', function () { // 连接断开
    socketList.splice(socketList.indexOf(socket), 1)
    console.log('Connection closed')
  })
  socket.on('end', function () { // 连接断开
    console.log('有一个客户端断开连接')
  })
  // socket.on('data', chunk => {
  // //   const msg = chunk.toString()
  // //   console.log(msg)

  // //   // 响应数据
  // //  socket.write(Buffer.from('你好，' + msg))
  // })
})

sock.on('close', function () { // 服务器关闭时触发，如果存在连接，这个事件不会被触发，直到所有的连接关闭
  console.log('服务器关闭')
})

sock.on('error', function (err) {
  console.log(err.message)
})
const corsOptions = {
  origin: ['http://rosui.s3-website-ap-northeast-1.amazonaws.com', 'http://localhost:8080'],
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus: 200
}

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors(corsOptions))

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', ['http://rosui.s3-website-ap-northeast-1.amazonaws.com', 'http://localhost:8080'])
  // 允许的header类型
  res.header('Access-Control-Allow-Headers', 'Origin, Methods, Content-Type, Authorization')
  // 跨域允许的请求方式
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')
  res.header('Access-Control-Allow-Credentials', true)
  if (req.method === 'OPTIONS') {
    res.status(200).send({
      msg: 'This option succes.'
    })
  } else {
    next()
  }
})

app.get('/download', async (req, res) => {
  try {
    res.send(
      socketList.map(sock =>
        `${sock.remoteAddress}\u00A0${sock.remotePort}`
      ).join('')
    )
  } catch (err) {
    res.send({ error: 'receive error: ' + err })
  }
})

app.post('/download', async (req, res) => {
  const msg = req.body.string // msg是前端傳給後端的下載指令
  const client = req.body.client // msg是前端傳給後端的device 訊息
  try {
    socketList.forEach(function (clients) {
      const eclient = `${clients.remoteAddress}\u00A0${clients.remotePort}`
      if (eclient === client) {
        // 可以通过端口号来区分是谁说的话
        clients.write(`${msg}\u00A0${client}`)
      } else {
        res.status(400).send('無此設備')
      }
    })
  } catch (err) {
    res.send({ error: 'receive error' })
    console.log('exception: ' + err)
  }
})

app.post('/custom', async (req, res) => {
  const msg = req.body.string // msg是前端傳給後端的
  console.log('DATA_custom : ' + msg)
  try {
    socketList[0].write(msg)
    res.end()
  } catch (err) {
    res.send({ error: 'receive error' })
  }
})

// app.post('/login', async (req, res) => {
//   res.send('login')
// })

require('./routes')(app)
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 8081;
// { force: true }
sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is running at: https://13.75.34.176:%s/', PORT)
    })
  })
