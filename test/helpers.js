const muxrpc = require('muxrpc')
const Blob = require('abstract-blob-store')

module.exports = {
  createFakeApiIgnoreHeartbeats,
  mediaStore
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
    return Object.keys(store.data)
  }
  return store
}

