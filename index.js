module.exports = EventStream

var Readable = require('readable-stream/readable')
  , add = require('add-event-listener')
  , inherits = require('inherits')
  , remove

remove = add.removeEventListener

function EventStream(el, eventName, options) {
  if(!(this instanceof EventStream)) {
    return new EventStream(el, eventName, options)
  }

  Readable.call(this, {objectMode: true, highWaterMark: 1})

  init(this, el, eventName, options || {})
}

inherits(EventStream, Readable)

var proto = EventStream.prototype

function init(stream, el, eventName, options) {
  stream.element = el

  stream._eventName = eventName
  stream._useCapture = !!options.useCapture
  stream._eventListener = function(ev) {
    stream._handle(ev)
  }
  stream._preventDefault = typeof options.preventDefault === 'function' ?
    options.preventDefault : Function('return ' + !!options.preventDefault)
  stream._stopPropagation = typeof options.stopPropagation === 'function' ?
    options.stopPropagation : Function('return ' + !!options.stopPropagation)

  add(el, eventName, stream._eventListener, stream._useCapture)
}

proto._read = function eventStream_read() {

}

proto.close = function eventStream_close() {
  this.push(null)
  remove(this.element, this._eventName, this._eventListener, this._useCapture)
}

proto._handle = function eventStream_handle(ev) {
  if(this._preventDefault(ev)) {
    ev.preventDefault()
  }

  if(this._stopPropagation(ev)) {
    ev.stopPropagation()
  }

  this.push(ev)
}
