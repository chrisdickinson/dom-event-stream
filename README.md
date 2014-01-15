# dom-event-stream

A streams2-compatible stream of DOMEvents over time.

```javascript

var events = require('dom-event-stream')

var replace = require('dom-replace-html-stream')

events(document.querySelector('#source'), 'keyup')
  .pipe(replace(document.querySelector('#source')))
```

## API

### events(DOMElement, eventName, eventStreamOptions={}) -> EventStream

Create a readable stream of DOMEvents intercepted by DOMElement for `eventName`.

#### eventStreamOptions

The options available are as follows:

* `useCapture`: determines whether the bound event listener will be in [capture mode](http://www.w3.org/TR/DOM-Level-3-Events/#event-flow) or not. 
* `preventDefault`: A boolean or a function accepting a DOMEvent and returning a boolean value.
* `stopPropagation`: A boolean or a function accepting a DOMEvent and returning a boolean value.

### EventStream#close -> undefined

Close the stream and remove the EventHandler from the DOM.

## License

MIT
