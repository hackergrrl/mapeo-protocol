const UpgradeProtocol = require('./upgrade-protocol')
const pull = require('pull-stream')
const MultiServer = require('multiserver')

const ms = MultiServer([
  [
    require('multiserver/plugins/net')({port: 3333}),
  ],
])
console.log(ms.stringify())

ms.server(function (socket) {
  console.log('connection from', socket.address)

  const proto = new UpgradeProtocol()
  const stream = proto.createStream()
  pull(
    stream,
    socket,
    stream
  )

  proto.rpcGetPeerInfo(console.log)
})

ms.client('net:localhost:3333', function (err, socket) {
  if (err) throw err
  console.log('connected to upgrade proto')

  const proto = new UpgradeProtocol()
  const stream = proto.createStream()
  pull(
    stream,
    socket,
    stream
  )

  proto.rpcGetPeerInfo(console.log)
})

