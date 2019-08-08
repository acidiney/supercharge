'use strict'

const Winston = require('winston')
const Config = require('../../config')
const { combine, timestamp, printf } = Winston.format

/**
 * Configure the Winston file logger with the
 * desired log file and a custom log format
 * that includes the ISO date time.
 */
class FileTransport {
  /**
   * Create a new file logger instance that
   * saves the readable UTC time besides
   * the unix time stamp.
   */
  constructor () {
    this.config = Config.get('logging.channels.file')

    return this.createTransporter()
  }

  createTransporter () {
    return new Winston.transports.File({
      filename: this.config.path,
      level: this.config.level,
      format: combine(
        timestamp(),
        printf(info => {
          const time = new Date(info.timestamp).getTime()

          return JSON.stringify(Object.assign(info, { time }))
        })
      )
    })
  }
}

module.exports = FileTransport
