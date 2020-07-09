const muxrpc = require('muxrpc')
const pull = require('pull-stream')

const PLAINTEXT_PROTOCOL_VERSION = '1.0.0'
const SECURE_PROTOCOL_VERSION = '1.0.0'

const rpcManifest = {
  hello: 'async',
  stuff: 'source'
}

class MapeoProtocol {
  constructor () {
    const api = {
      hello: this.rpcHello.bind(this),
      values: this.rpcValues.bind(this),
      GetInfo: this.rpcGetPeerInfo.bind(this)
    }
    this.rpc = muxrpc(rpcManifest, rpcManifest)(api)
  }

  rpcHello (name, cb) {
    cb(null, 'hello, ' + name + '!')
  }

  rpcValues () {
    return pull.values([1, 2, 3, 4, 5])
  }

  rpcGetPeerInfo (cb) {
    cb(null, {
      plaintextProtocolVersion: PLAINTEXT_PROTOCOL_VERSION,
      secureProtocolVersion: SECURE_PROTOCOL_VERSION
    })
  }

  createStream () {
    return this.rpc.createStream()
  }
}

module.exports = MapeoProtocol

