const muxrpc = require('muxrpc')
const pull = require('pull-stream')

const PLAINTEXT_PROTOCOL_VERSION = '1.0.0'
const SECURE_PROTOCOL_VERSION = '1.0.0'

const rpcManifest = {
  GetInfo: 'async',
  CreateSecureChannel: 'duplex'
}

class MapeoProtocol {
  constructor () {
    const api = {
      GetInfo: this.rpcGetPeerInfo.bind(this),
      CreateSecureChannel: this.rpcCreateSecureChannel.bind(this)
    }
    this.rpc = muxrpc(rpcManifest, rpcManifest)(api)
  }

  rpcGetPeerInfo (cb) {
    cb(null, {
      plaintextProtocolVersion: PLAINTEXT_PROTOCOL_VERSION,
      secureProtocolVersion: SECURE_PROTOCOL_VERSION
    })
  }

  // TODO: implementation
  rpcCreateSecureChannel () {
    return null
  }

  createStream () {
    return this.rpc.createStream()
  }
}

module.exports = MapeoProtocol

