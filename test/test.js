const test = require('tape')
const pull = require('pull-stream')
const muxrpc = require('muxrpc')
const Protocol = require('..')

test('can create & get duplex stream', function (t) {
  t.plan(2)

  try {
    const proto = new Protocol()
    const stream = proto.createStream()
    t.same(typeof stream.source, 'function', 'has source side')
    t.same(typeof stream.sink, 'function', 'has sink side')
  } catch (e) {
    t.error(e)
  }
})

test('rpc: GetPeerInfo', function (t) {
  t.plan(3)

  const proto1 = new Protocol()
  const proto2 = new Protocol()
  const stream1 = proto1.createStream()
  const stream2 = proto2.createStream()

  pull(stream1, stream2, stream1)

  proto1.rpcGetPeerInfo((err, res) => {
    t.error(err)
    t.same(res.secureProtocolVersion, '1.0.0', 'secure protocol version ok')
    t.same(res.plaintextProtocolVersion, '1.0.0', 'plaintext protocol version ok')
  })
})

test('rpc: Heartbeat', function (t) {
  t.plan(2)

  const proto1 = new Protocol()
  const proto2 = new Protocol()
  const stream1 = proto1.createStream()
  const stream2 = proto2.createStream()

  pull(stream1, stream2, stream1)

  proto1.rpcHeartbeat(err => {
    t.error(err, 'stream1 heartbeat ok')
  })

  proto2.rpcHeartbeat(err => {
    t.error(err, 'stream2 heartbeat ok')
  })
})

test('heartbeats keep connection alive', function (t) {
  t.plan(1)

  const opts = { timeout: 100 }

  const proto1 = new Protocol(opts)
  const proto2 = new Protocol(opts)
  const stream1 = proto1.createStream(prematureEnd)
  const stream2 = proto2.createStream(prematureEnd)

  pull(
    stream1,
    stream2,
    stream1
  )

  setTimeout(() => {
    t.pass('connection kept alive ok')
  }, 400)

  function prematureEnd (err) {
    t.fail('protocol should not terminate')
  }
})

test('protocol times out without heartbeat responses', function (t) {
  t.plan(2)

  const opts = { timeout: 200 }

  const proto1 = new Protocol(opts)
  const stream1 = proto1.createStream(onEnd)
  const stream2 = createFakeApiIgnoreHeartbeats().createStream()

  let ended = false

  pull(stream1, stream2, stream1)

  const id = setTimeout(() => {
    t.fail('timed out without ending properly')
  }, 400)

  function onEnd (err) {
    t.ok(err, 'ended with error')
    t.ok(/remote timeout/.test(err.message), 'error message ok')
    clearTimeout(id)
  }
})

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
