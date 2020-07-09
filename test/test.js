const test = require('tape')
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
