const muxrpc = require('muxrpc')
const pull = require('pull-stream')

const rpcManifest = {
  hello: 'async',
  stuff: 'source'
}

class MapeoProtocol {
  constructor () {
    const api = {
      hello: this.rpcHello.bind(this),
      values: this.rpcValues.bind(this)
    }
    this.rpc = muxrpc(rpcManifest, rpcManifest)(api)
  }

  rpcHello (name, cb) {
    cb(null, 'hello, ' + name + '!')
  }

  rpcValues () {
    return pull.values([1, 2, 3, 4, 5])
  }

  createStream () {
    return this.rpc.createStream()
  }
}

module.exports = MapeoProtocol

