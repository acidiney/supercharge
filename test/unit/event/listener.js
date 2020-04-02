'use strict'

const Listener = require('../../../event/listener')
const BaseTest = require('../../../base-test')

class ListenerTest extends BaseTest {
  async createsListener (t) {
    const listener = new Listener()
    t.truthy(listener)
  }

  async isDefaultUserType (t) {
    const listener = new Listener()
    t.is(listener.type(), 'user')
  }

  async canOverrideType (t) {
    class TypeTestListener extends Listener {
      type () { return 'test-type' }
    }

    const listener = new TypeTestListener()
    t.is(listener.type(), 'test-type')
  }

  async throwsDueToMissingOnFunction (t) {
    const listener = new Listener()
    t.throws(() => listener.on())
  }

  async throwsDueToMissingHandleFunction (t) {
    const listener = new Listener()
    await t.throwsAsync(async () => listener.handle())
  }
}

module.exports = new ListenerTest()
