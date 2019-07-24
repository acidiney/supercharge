'use strict'

const Event = require('../../../event')
const BaseTest = require('../../../base-test')
const Dispatcher = require('../../../event/dispatcher')

class EventTest extends BaseTest {
  async emitsConstructorNameByDefault (t) {
    const event = new Event()
    t.is(event.emit(), 'Event')
  }

  async onOff (t) {
    const event = 'test.on'
    const handler = function () {}

    Event.on(event, handler)
    t.is(Dispatcher.listenerCount(event), 1)

    Event.fire('test.on')

    Event.off(event, handler)
    t.is(Dispatcher.listenerCount(event), 0)
  }

  async listenForget (t) {
    const event = 'test.on'
    const handler = function () {}

    Event.listen(event, handler)
    t.is(Dispatcher.listenerCount(event), 1)

    Event.fire('test.on')

    Event.forget(event, handler)
    t.is(Dispatcher.listenerCount(event), 0)
  }

  async listenForgetArray (t) {
    const event = 'test.on'
    const handler = function () {}

    Event.listen(event, handler)
    t.is(Dispatcher.listenerCount(event), 1)

    Event.fire('test.on')

    Event.forget([event, event], handler)
    t.is(Dispatcher.listenerCount(event), 0)
  }

  async fire (t) {
    const event = 'test.on'
    const spy = this.spy()

    Event.on(event, spy)
    Event.fire(event, 'data')
    Event.forget(event, spy)

    t.true(spy.called)
  }
}

module.exports = new EventTest()
