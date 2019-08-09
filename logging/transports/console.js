'use strict'

const Chalk = require('chalk')
const Winston = require('winston')
const Config = require('../../config')
const { combine, timestamp, printf } = Winston.format

/**
 * Configure the Winston console logger with the
 * desired log file and a custom log format
 * that includes the ISO date time.
 */
class ConsoleTransport {
  /**
   * Create a new console logger instance that
   * logs a colored message.
   */
  constructor () {
    this.config = Config.get('logging.channels.console')
    this.colors = this.logColors()

    return this.createTransporter()
  }

  /**
   * Color levels, ranked ascending
   * from freakout to chilly
   *
   * @returns {Object}
   */
  logColors () {
    return {
      error: Chalk.bold.red,
      warn: Chalk.yellow,
      info: Chalk.green,
      verbose: Chalk.blue,
      debug: Chalk.yellow,
      silly: Chalk.grey
    }
  }

  /**
   * Create a Winston console transporter.
   *
   * @returns {Object}
   */
  createTransporter () {
    return new Winston.transports.Console({
      level: this.config.level,
      format: combine(
        timestamp(),
        printf(info => this.format(info))
      )
    })
  }

  /**
   * Return a chalk function for the related log level,
   * to print colored logs.
   *
   * E.g.,
   * info  => green
   * warn  => yellow
   * error => bold red
   *
   * @param {integer} label - Winston log level as a string label
   *
   * @returns {Function}
   */
  getColorForLevel (label) {
    return this.colors[label] || Chalk.white
  }

  /**
   * Returns a custom log format function.
   *
   * @returns {Function}
   */
  format (info) {
    const color = this.getColorForLevel(info.level)
    const time = new Date(info.timestamp).getTime()

    return `${Chalk.gray(time)} ${color(info.level)} ${info.message}`
  }
}

module.exports = ConsoleTransport
