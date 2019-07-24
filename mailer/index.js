'use strict'

const Message = require('./message')
const Config = require('../config')
const Logger = require('../logging')
const Bounce = require('@hapi/bounce')
const Transports = require('./transports')

class Mailer {
  /**
   * Create a new mailer instance.
   */
  constructor () {
    this.fromAddress = Config.get('mail.from')
    this.replyToAddress = Config.get('mail.from')

    const driver = Config.get('mail.driver') || 'null'
    const transports = Config.get('mail.transports') || { null: {} }
    const transporterOptions = transports[driver]
    const Transporter = Transports[driver]

    this.transporter = new Transporter(transporterOptions)
  }

  /**
   * Start the mail sending process of a
   * mailable class instance.
   *
   * @param {String|Object|Array} users
   */
  to (users) {
    return new Message(this).to(users)
  }

  /**
   * Start the mail sending process of a
   * mailable class instance.
   *
   * @param {String|Object|Array} users
   */
  cc (users) {
    return new Message(this).cc(users)
  }

  /**
   * Start the mail sending process of a
   * mailable class instance.
   *
   * @param {String|Object|Array} users
   */
  bcc (users) {
    return new Message(this).bcc(users)
  }

  /**
   * Start the mail sending process of a
   * mailable class instance.
   *
   * @param {String|Object|Array} address
   * @param {String} name
   */
  from (address, name) {
    return new Message(this).from(address, name)
  }

  /**
   * Start the mail sending process of a
   * mailable class instance.
   *
   * @param {String|Object|Array} address
   * @param {String} name
   */
  replyTo (address, name) {
    return new Message(this).replyTo(address, name)
  }

  /**
   * Send an email and don’t worry about success or failure.
   * This catches application errors (we don’t care about),
   * but still throw system errors.
   */
  async fireAndForget (mailable) {
    try {
      await this.send(mailable)
    } catch (err) {
      Bounce.rethrow(err, 'system')
    }
  }

  /**
   * Send a message using the mailable instance.
   *
   * @param {Object} mailable
   */
  async send (mailable = {}) {
    if (Object.getPrototypeOf(mailable.constructor).name !== 'Mailable') {
      throw new Error('Pass a Mailable instance to the Mailer.send(mailable) method.')
    }

    const { to, cc, bcc, subject, html, text, from = this.fromAddress, replyTo = this.replyToAddress } = await mailable.buildMessage()
    const message = { from, to, cc, bcc, replyTo, subject, html, text }

    try {
      await this.transporter.sendMail(message)
    } catch (err) {
      Logger.error(err.message)
      throw err
    }
  }
}

module.exports = new Mailer()
