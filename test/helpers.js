const muxrpc = require('muxrpc')

module.exports = {
  createFakeApiIgnoreHeartbeats
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
