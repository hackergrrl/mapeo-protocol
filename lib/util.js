const pull = require('pull-stream')

module.exports = {
  errorDuplex,
  noop
}

function errorSource (err) {
  return function (end, cb) {
    process.nextTick(cb, err)
  }
}

function errorDuplex (err) {
  return {
    sink: pull.drain(noop, noop),
    source: errorSource(err)
  }
}

function noop () {}

