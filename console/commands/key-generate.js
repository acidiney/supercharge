'use strict'

const Encryption = require('../../encryption')
const BaseCommand = require('../base-command')

/**
 * Craft command to generate an application key.
 */
class KeyGenerate extends BaseCommand {
  /**
   * Options allow the user to forcefully
   * override an existing application key
   * or only echo the key on the CLI.
   */
  static get signature () {
    return `
      key:generate
        { --force: Override any existing application key }
        { --echo: Print the generated key to the terminal instead of writing it to the .env file }
    `
  }

  /**
   * Returns the command description.
   */
  static get description () {
    return 'Generate a secret application key'
  }

  /**
   * Generate an application key and either
   * echo it to the terminal or set it
   * in the project's .env file.
   *
   * @param {Object} arguments
   */
  async handle (_, { force, echo }) {
    const key = Encryption.generateKey()

    if (echo) {
      return this.completed('generated', `Application key: ${key}`)
    }

    await this.run(async () => {
      await this.ensureNotInstalled(force)

      const envPath = await this.getEnvPath()
      await this.updateEnvContents(envPath, { APP_KEY: key })

      this.completed('generated', `Application key [${key}] set as APP_KEY in your .env file`)
    })
  }
}

module.exports = KeyGenerate
