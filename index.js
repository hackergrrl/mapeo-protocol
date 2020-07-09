const muxrpc = require('muxrpc')

const rpcManifest = {
  hello: 'async',
  stuff: 'source'
}

class MapeoProtocol {
  constructor () {
    const api = {
      hello: this.rpcHello.bind(this),
      stuff: this.rpcStuff.bind(this)
    }
    this.rpc = muxrpc(rpcManifest, rpcManifest)(api)
  }

  rpcHello (name, cb) {
    cb(null, 'hello, ' + name + '!')
  }

  rpcStuff () {
    return pull.values([1, 2, 3, 4, 5])
  }

  createStream () {
    return this.rpc.createStream()
  }
}

module.exports = MapeoProtocol

