const muxrpc = require('muxrpc')
const timer = require('timeout-refresh')

const PLAINTEXT_PROTOCOL_VERSION = '1.0.0'
const SECURE_PROTOCOL_VERSION    = '1.0.0'

function noop () {}

const rpcManifest = {
  GetInfo: 'async',
  Heartbeat: 'async',
  CreateSecureChannel: 'duplex'
}

class MapeoProtocol {
  constructor (opts) {
    opts = opts || {}

    const api = {
      GetInfo: this.rpcGetPeerInfo.bind(this),
      Heartbeat: this.rpcHeartbeat.bind(this),
      CreateSecureChannel: this.rpcCreateSecureChannel.bind(this)
    }
    this.rpc = muxrpc(rpcManifest, rpcManifest)(api)
    this.rpcStream = null

    this.timeoutMs = opts.timeout || 20000

    // Timers
    this.timeout = null
    this.heartbeat = null
  }

  rpcGetPeerInfo (cb) {
    cb(null, {
      plaintextProtocolVersion: PLAINTEXT_PROTOCOL_VERSION,
      secureProtocolVersion: SECURE_PROTOCOL_VERSION
    })
  }

  rpcHeartbeat (cb) {
    this.timeout.refresh()
    this.heartbeat.refresh()
    cb()
  }

  rpcCreateSecureChannel () {
    throw new Error('not implemented')
  }

  createStream (cb) {
    if (this.rpcStream) return false
    cb = cb || noop

    this.rpcStream = this.rpc.createStream(err => {
      this.onRpcClose(err)
      cb(err)
    })

    this.timeout = timer(this.timeoutMs, this.onTimeout, this)
    this.heartbeat = timer(Math.floor(this.timeoutMs/2), this.onHeartbeat, this)

    return this.rpcStream
  }

  onRpcClose (err) {
    this.timeout.destroy()
    this.heartbeat.destroy()
    this.rpcStream = null
    this.timeout = null
    this.heartbeat = null
  }

  onTimeout () {
    this.close(new Error('remote timeout'))
  }

  onHeartbeat () {
    this.heartbeat.destroy()
    this.heartbeat = timer(Math.floor(this.timeoutMs/2), this.onHeartbeat, this)

    this.rpc.Heartbeat((err) => {
      if (err) return
      this.timeout.refresh()
      this.heartbeat.refresh()
    })
  }

  close (err, cb) {
    cb = cb || noop
    if (this.rpcStream) {
      this.timeout.destroy()
      this.heartbeat.destroy()
      this.rpc.close(err, cb.bind(null, err))
    } else {
      process.nextTick(cb)
    }
  }
}

module.exports = MapeoProtocol
