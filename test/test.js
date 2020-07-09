const test = require('tape')
const pull = require('pull-stream')
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

