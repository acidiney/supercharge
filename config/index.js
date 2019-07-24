'use strict'

const _ = require('lodash')
const Fs = require('../filesystem')
const RequireAll = require('require-all')

/**
 * This is the central application configuration.
 * Manage the configuration by reading all
 * `.js` files from the `config` folder.
 */
class Config {
  /**
   * Initialize the application configuration
   * by setting the configuration path and
   * reading all config files.
   */
  constructor (items = {}) {
    this.config = items
  }

  /**
   * Import all application configuration items
   * from the given `path`.
   */
  async loadConfigFiles (path) {
    if (await Fs.exists(path)) {
      this.config = RequireAll({
        dirname: path,
        filter: /(.*)\.js$/
      })
    }
  }

  /**
   * Returns the requested config value.
   *
   * @param {String} key
   * @param {Mixed} defaultValue
   *
   * @returns {Mixed}
   */
  get (key, defaultValue) {
    return _.get(this.config, key, defaultValue)
  }

  /**
   * Set a config value.
   *
   * @param {String} key
   * @param {Mixed} value
   *
   * @returns {Mixed}
   */
  set (key, value) {
    return _.set(this.config, key, value)
  }
}

module.exports = new Config()
