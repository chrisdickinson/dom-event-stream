var readable = require('readable-stream')
  , through2 = require('through2')

var events = require('./index.js')

var input = document.createElement('input')
  , keys = document.createElement('pre')
  , pos = document.createElement('pre')

var moves

document.body.appendChild(input)
document.body.appendChild(keys)
document.body.appendChild(pos)

events(document.body, 'keyup')
  .pipe(through2({objectMode: true}, onkeyup))
  .pipe(writeToElement(keys))

moves = events(document.body, 'mousemove')

moves
  .pipe(through2({objectMode: true}, onread))
  .pipe(writeToElement(pos))

events(input, 'keyup')
  .on('data', flowingmode)

function flowingmode(ev) {
  if(ev.keyCode === 13) {
    moves.close()
  }
}

function onkeyup(ev, enc, ready) {
  this.push('Key: ' + String.fromCharCode(ev.keyCode))
  ready()
}

function onread(ev, enc, ready) {
  this.push('X: ' + ev.x + '; Y: ' + ev.y)
  ready()
}

function writeToElement(el) {
  var writable = readable.Writable({objectMode: true})

  writable._write = onwrite

  return writable

  function onwrite(chunk, encoding, ready) {
    el.textContent = chunk
    ready()
  }
}
