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

test('test rpc: hello', function (t) {
  t.plan(2)

  const proto1 = new Protocol()
  const proto2 = new Protocol()
  const stream1 = proto1.createStream()
  const stream2 = proto2.createStream()

  pull(stream1, stream2, stream1)

  proto1.rpcHello('there', (err, res) => {
    t.error(err)
    t.same(res, 'hello, there!', 'response ok')
  })
})

test('test rpc: values', function (t) {
  t.plan(2)

  const proto1 = new Protocol()
  const proto2 = new Protocol()
  const stream1 = proto1.createStream()
  const stream2 = proto2.createStream()

  pull(stream1, stream2, stream1)

  pull(
    proto2.rpcValues(),
    pull.collect(function (err, res) {
      t.error(err)
      t.deepEquals(res, [1,2,3,4,5], 'response ok')
    })
  )
})

