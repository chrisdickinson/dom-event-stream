var readable = require('readable-stream')
  , add = require('add-event-listener')
  , test = require('tape')
  , ever = require('ever')

var events = require('./index.js')

test('test preventDefault option / boolean', function(assert) {
  var el = setup()
    , out = sink()
    , emitter

  events(el, 'click', {preventDefault: true})
    .pipe(out)

  emitter = ever(el)

  emitter.emit('click', {cancelable: true})

  assert.equal(out.received.length, 1, 'received one event')
  assert.ok(out.received[0].defaultPrevented, 'default should be prevented')
  assert.end()
})

test('test stopPropagation option / boolean', function(assert) {
  var el = setup()
    , out = sink()
    , emitter
    , evs

  events(el, 'click', {stopPropagation: true, maxPendingEvents: 1})

  evs = events(document.body, 'click')

  evs.pipe(out)

  add(document.body, 'click', failOnEvent)

  emitter = ever(el)
  emitter.emit('click', {cancelable: true, canBubble: true})

  assert.equal(out.received.length, 0, 'received zero events')
  add.removeEventListener(document.body, 'click', failOnEvent)
  evs.close()

  assert.end()

  function failOnEvent(ev) {
    assert.ok(!ev, 'should not see this event')
  }
})

test('test useCapture works', function(assert) {
  if(!document.addEventListener) {
    assert.ok(true, '(unsupported)')

    return assert.end()
  }

  var el = setup()
    , out = sink()
    , order = []
    , emitter
    , outer
    , inner

  outer = events(document.body, 'click', {useCapture: true})

  outer.on('data', function() {
    order.push(outer.element.tagName)
  })

  inner = events(el, 'click')
  inner.on('data', function() {
    order.push(inner.element.tagName)
  })

  emitter = ever(el)
  emitter.emit('click', {cancelable: true, canBubble: true})

  assert.deepEqual(order, ['BODY', 'A'])

  outer.close()
  inner.close()
  assert.end()
})

test('test .close() cancels future events', function(assert) {
  var el = setup()
    , out = sink()
    , order = []
    , emitter
    , stream

  stream = events(el, 'click')

  stream.pipe(out)

  emitter = ever(el)
  emitter.emit('click', {cancelable: true, canBubble: true})

  assert.equal(out.received.length, 1)
  stream.close()

  emitter.emit('click', {cancelable: true, canBubble: true})
  assert.equal(out.received.length, 1)

  assert.end()
})

test('test multiple instances work in tandem', function(assert) {
  assert.end()
})

function setup() {
  var element = document.createElement('a')

  element.href = '#test'
  document.body.appendChild(element)

  return element
}

function sink() {
  var stream = new readable.Writable({objectMode: true})
    , accum = []

  stream._write = function(chunk, enc, ready) {
    accum.push(chunk)
    ready()
  }

  stream.received = accum

  return stream
}
