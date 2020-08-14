const muxrpc = require('muxrpc')
const timer = require('timeout-refresh')
const toPull = require('stream-to-pull-stream')
const defer = require('pull-defer')
const util = require('./lib/util')

const PROTOCOL_VERSION = '6.0.0'

const rpcManifest = {
  GetInfo: 'async',
  Heartbeat: 'async',
  SyncMultifeed: 'duplex',
  SyncMediaBlobs: 'duplex'
}

class SyncProtocol {
  constructor (multifeed, mediaStore, deviceInfo, opts) {
    opts = opts || {}

    if (!multifeed) throw new Error('must specify multifeed')
    if (!mediaStore) throw new Error('must specify mediaStore')
    if (!deviceInfo) throw new Error('must specify deviceInfo')
    if (!deviceInfo.name) throw new Error('must specify deviceInfo.name')
    if (!deviceInfo.type) throw new Error('must specify deviceInfo.type')
    this.multifeed = multifeed
    this.deviceName = deviceInfo.name
    this.deviceType = deviceInfo.type


    const api = {
      GetInfo: this.rpcGetPeerInfo.bind(this),
      Heartbeat: this.rpcHeartbeat.bind(this),
      SyncMultifeed: this.rpcSyncMultifeed.bind(this),
      SyncMediaBlobs: this.rpcSyncMediaBlobs.bind(this)
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
      protocolVersion: PROTOCOL_VERSION,
      deviceName: this.deviceName,
      deviceType: this.deviceType
    })
  }

  rpcHeartbeat (cb) {
    this.timeout.refresh()
    this.heartbeat.refresh()
    cb()
  }

  rpcSyncMultifeed () {
    this.multifeed.ready(() => {
      const inner = toPull.duplex(this.multifeed.replicate(false))
      sink.resolve(inner.sink)
      source.resolve(inner.source)
    })

    const sink = defer.sink()
    const source = defer.source()
    return { sink, source }
  }

  rpcSyncMediaBlobs () {
    return util.errorDuplex(new Error('not implemented'))
  }

  createStream (cb) {
    if (this.rpcStream) return false
    cb = cb || util.noop

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
    cb = cb || util.noop
    if (this.rpcStream) {
      this.timeout.destroy()
      this.heartbeat.destroy()
      this.rpc.close(err, cb.bind(null, err))
    } else {
      process.nextTick(cb)
    }
  }
}

module.exports = SyncProtocol

