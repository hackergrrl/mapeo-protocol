const SyncProtocol = require('./sync-protocol')
const pull = require('pull-stream')
const MultiServer = require('multiserver')
const chloride = require('chloride')
const keys = chloride.crypto_sign_keypair()
const appKey = "dTuPysQsRoyWzmsK6iegSV4U3Qu912vPpkOyx6bPuEk="

function accept_all (id, cb) {
  cb(null, true)
}
const ms = MultiServer([
  [ //net + secret-handshake
    require('multiserver/plugins/net')({port: 3334}),
    require('multiserver/plugins/shs')({
      keys: keys,
      appKey: appKey, //application key
      auth: accept_all
    }),
  ],
])
console.log(ms.stringify())

ms.server(function (socket) {
  console.log('connection from', socket.address)

  const proto = new SyncProtocol()
  const stream = proto.createStream()
  pull(
    stream,
    socket,
    stream
  )

  proto.rpcGetPeerInfo(console.log)
})

ms.client('net:localhost:3333~shs:'+keys.publicKey.toString('base64'), function (err, stream) {
  if (err) throw err
  console.log('connected to secure sync protocol')

  const proto = new SyncProtocol()
  const stream = proto.createStream()
  pull(
    stream,
    socket,
    stream
  )

  proto.rpcGetPeerInfo(console.log)
})

