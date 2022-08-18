'use strict'

import { HashManager } from './hash-manager'
import { ServiceProvider } from '@supercharge/support'

export class HashingServiceProvider extends ServiceProvider {
  /**
   * Register the hash manager into the container.
   */
  override register (): void {
    this.registerHashManager()
  }

  /**
   * Register the encrypter instance.
   */
  protected registerHashManager (): void {
    this.app().singleton('hash', () => {
      return new HashManager(this.app())
    })
  }
}
