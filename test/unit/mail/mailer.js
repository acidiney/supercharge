'use strict'

const Config = require('../../../config')
const Mailer = require('../../../mailer')
const BaseTest = require('../../../base-test')
const TestMailable = require('./fixtures/test-mailable')

class MailerTest extends BaseTest {
  before () {
    Config.set('mail.driver', 'null')
    Config.set('mail.transports', { null: {} })
    Config.set('mail.from', 'marcus@superchargejs.com')
  }

  async hasDefaultFrom (t) {
    const mailer = new Mailer.constructor()
    t.truthy(mailer.fromAddress)
  }

  async hasDefaultReplyTo (t) {
    const mailer = new Mailer.constructor()
    t.truthy(mailer.replyToAddress)
  }

  async hasTransporter (t) {
    t.truthy(Mailer.transporter)
  }

  async toUserString (t) {
    const address = 'marcus@futurestud.io'
    const message = Mailer.to(address)
    t.is(message.address.to, address)
  }

  async toUserObject (t) {
    const address = { name: 'Marcus', address: 'marcus@futurestud.io' }
    const message = Mailer.to(address)
    t.is(message.address.to, address)
  }

  async toUserArray (t) {
    const address = ['marcus@futurestud.io', 'norman@futurestud.io', 'christian@futurestud.io']
    const message = Mailer.to(address)
    t.is(message.address.to, address)
  }

  async cc (t) {
    const address = 'marcus@futurestud.io'
    const message = Mailer.cc(address)
    t.is(message.address.cc, address)
  }

  async bcc (t) {
    const address = 'marcus@futurestud.io'
    const message = Mailer.bcc(address)
    t.is(message.address.bcc, address)
  }

  async from (t) {
    const address = 'marcus@futurestud.io'
    const message = Mailer.from(address)
    t.is(message.address.from, address)
  }

  async fromNameAddress (t) {
    const message = Mailer.from('marcus@futurestud.io', 'Marcus')
    t.deepEqual(message.address.from, { name: 'Marcus', address: 'marcus@futurestud.io' })
  }

  async replyTo (t) {
    const address = 'marcus@futurestud.io'
    const message = Mailer.replyTo(address)
    t.is(message.address.replyTo, address)
  }

  async replyToNameAddress (t) {
    const message = Mailer.replyTo('marcus@futurestud.io', 'Marcus')
    t.deepEqual(message.address.replyTo, { name: 'Marcus', address: 'marcus@futurestud.io' })
  }

  async failsSendForEmptyMailableParameter (t) {
    const error = await t.throwsAsync(async () => Mailer.send())
    t.true(error.message.includes('Pass a Mailable instance to the Mailer'))
  }

  async failsSendForNonMailableParameter (t) {
    class TestMail {}
    const error = await t.throwsAsync(async () => Mailer.send(new TestMail()))
    t.true(error.message.includes('Pass a Mailable instance to the Mailer'))
  }

  async serialSendMail (t) {
    const stub = this.stub(Mailer.transporter, 'sendMail')

    await Mailer.send(new TestMailable())

    this.sinon().assert.called(stub)
    stub.restore()

    t.pass()
  }

  async serialSendMailTo (t) {
    const stub = this.stub(Mailer.transporter, 'sendMail')

    await Mailer.to('marcus@futurestud.io').send(new TestMailable())

    this.sinon().assert.called(stub)
    stub.restore()

    t.pass()
  }

  async serialThrowsWhenSendMailFails (t) {
    const stub = this.stub(Mailer.transporter, 'sendMail').throws(new Error('fake sendMail error'))

    this.muteConsole()
    const error = await t.throwsAsync(async () => Mailer.send(new TestMailable()))
    this.consoleOutput()

    this.sinon().assert.called(stub)
    stub.restore()

    t.is(error.message, 'fake sendMail error')
  }

  async serialFireAndForget (t) {
    const stub = this.stub(Mailer.transporter, 'sendMail')

    await Mailer.fireAndForget(new TestMailable())

    this.sinon().assert.called(stub)
    stub.restore()

    t.pass()
  }

  async serialFireAndForgetFailsWithoutThrowing (t) {
    const error = new Error('fake error')
    const stub = this.stub(Mailer.transporter, 'sendMail').throws(error)

    this.muteConsole()
    await Mailer.fireAndForget(new TestMailable())
    this.consoleOutput()

    this.sinon().assert.called(stub)
    stub.restore()

    t.pass()
  }

  async serialFireAndForgetFailsAndThrowsSystemErrors (t) {
    const error = new URIError('fake uri error')
    const stub = this.stub(Mailer.transporter, 'sendMail').throws(error)

    this.muteConsole()
    await t.throwsAsync(Mailer.fireAndForget(new TestMailable()))
    this.consoleOutput()

    this.sinon().assert.called(stub)
    stub.restore()

    t.is(error.message, 'fake uri error')
  }
}

module.exports = new MailerTest()
