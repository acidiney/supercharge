'use strict'

import Fs from 'node:fs'
import { Manifest, ManifestChunk } from 'vite'

export class ViteManifest {
  /**
   * Stores the Vite manifest object.
   */
  private readonly manifest: Manifest

  /**
   * Create a new instance.
   */
  constructor (manifest: Manifest) {
    this.manifest = manifest
  }

  /**
   * Generate HTML tags for the given `entrypoints`.
   *
   * @param entrypoints The entrypoints to handle.
   * @param buildDirectory
   *
   * @returns {Vite}
   */
  static loadFrom (manifestPath: string): ViteManifest {
    this.ensureManifestExists(manifestPath)

    const manifest = JSON.parse(
      Fs.readFileSync(manifestPath, 'utf8')
    )

    return new this(manifest)
  }

  /**
   * Ensure the Vite manifest file exists.
   */
  static ensureManifestExists (manifestPath: string): void {
    if (!Fs.existsSync(manifestPath)) {
      throw new Error(`Vite manifest file not found at path: ${manifestPath} `)
    }
  }

  /**
   * Determine whether the given `entrypoint` exists in the manifest.
   *
   * @param entrypoint
   *
   * @returns {Boolean}
   */
  hasEntrypoint (entrypoint: string): boolean {
    try {
      this.getChunk(entrypoint)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Returns the manifest chunk for the given `entrypoint`. Throws an error If no chunk
   * exists
   */
  getChunk (entrypoint: string): ManifestChunk {
    const chunk = this.manifest[entrypoint]

    if (!chunk) {
      throw new Error(`Entrypoint not found in manifest: ${entrypoint}`)
    }

    return chunk
  }
}
