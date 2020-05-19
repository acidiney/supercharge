'use strict'

import Hash from './index'
import { Application } from '@supercharge/contracts'

export class ConfigBootstrapper {
  /**
   * Run the app bootstrapping.
   *
   * @param {Application} app
   */
  async boot (app: Application): Promise<void> {
    Hash.setApp(app)
  }
}
