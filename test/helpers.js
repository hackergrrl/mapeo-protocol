const muxrpc = require('muxrpc')
const Blob = require('abstract-blob-store')
const pull = require('pull-stream')

module.exports = {
  createFakeApiIgnoreHeartbeats,
  mediaStore,
  onEnd
}

function createFakeApiIgnoreHeartbeats () {
  const rpcManifest = {
    Heartbeat: 'async'
  }
  const api = {
    Heartbeat: function (cb) {
      // do nothing
    }
  }
  return muxrpc(rpcManifest, rpcManifest)(api)
}

function mediaStore () {
  const store = Blob()
  store.list = (cb) => {
    process.nextTick(cb, null, Object.keys(store.data))
  }
  return store
}

function onEnd (cb) {
  return pull.through(data => data, cb)
}

