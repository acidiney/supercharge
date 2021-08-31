'use strict'

import { Context } from 'koa'
import { FileBag } from './file-bag'
import Str from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { RouterContext } from 'koa__router'
import { IncomingHttpHeaders, IncomingMessage } from 'http'
import { HttpRequest, InteractsWithContentTypes, UploadedFile } from '@supercharge/contracts'

/**
 * Represents uploaded files.
 */
interface Files {
  [name: string]: UploadedFile | UploadedFile[]
}

export class Request implements HttpRequest, InteractsWithContentTypes {
  /**
   * The route context object from Koa.
   */
  protected readonly ctx: Context | Context & RouterContext

  /**
   * Stores request meta data.
   */
  protected readonly meta: {
    /**
     * Stores the raw request payload.
     */
    rawPayload?: any

    /**
     * Stores the uploaded files on the request.
     */
    files: Files
  }

  /**
   * Create a new response instance.
   *
   * @param ctx
   * @param cookieOptions
   */
  constructor (ctx: Context | Context & RouterContext) {
    this.ctx = ctx
    this.meta = { files: {} }
  }

  /**
   * Returns the raw Node.js request.
   */
  req (): IncomingMessage {
    return this.ctx.req
  }

  /**
   * Returns the request method.
   */
  method (): string {
    return this.ctx.request.method
  }

  /**
   * Returns the request’s URL path.
   */
  path (): string {
    return this.ctx.request.path
  }

  /**
   * Returns the request’s query parameters.
   */
  get query (): Record<string, any> {
    return this.ctx.query
  }

  /**
   * Returns the request’s path parameters.
   */
  get params (): Record<string, any> {
    return this.ctx.params
  }

  /**
   * Returns the request payload.
   */
  get payload (): any {
    return this.ctx.request.body
  }

  /**
   * Determine whether a request body exists.
   */
  hasPayload (): boolean {
    return !!this.header('transfer-encoding') || !isNaN(Number(this.header('content-length')))
  }

  /**
   * Assign the given `payload` as the request body.
   *
   * @param {*} payload
   *
   * @returns {this}
   */
  setPayload (payload: any): this {
    return tap(this, () => {
      this.ctx.request.body = payload
    })
  }

  /**
   * Returns the raw request payload
   */
  rawPayload (): any {
    return this.meta.rawPayload
  }

  /**
   * Store the given raw `payload` for this request.
   *
   * @param {*} payload
   *
   * @returns {this}
   */
  setRawPayload (payload: any): this {
    return tap(this, () => {
      this.meta.rawPayload = payload
    })
  }

  /**
   * Returns all files on the request.
   *
   * @returns {FileBag}
   */
  files (): FileBag {
    return new FileBag(this.meta.files)
  }

  /**
   * Assign the given `files` to the request.
   *
   * @param {Files} files
   *
   * @returns {this}
   */
  setFiles (files: Files): this {
    return tap(this, () => {
      this.meta.files = files
    })
  }

  /**
   * Returns the request headers.
   */
  get headers (): IncomingHttpHeaders {
    return this.ctx.headers
  }

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   *
   * @param {String} key
   * @param {*} defaultValue
   *
   * @returns {String}
   */
  header (key: string, defaultValue?: any): string | undefined {
    return this.headers[key] ?? defaultValue
  }

  /**
   * Determine whether the request contains a header with the given `key`.
   *
   * @returns {Boolean}
   */
  hasHeader (key: string): boolean {
    return !!this.header(key)
  }

  /**
   * Determine whether the request is sending JSON payload.
   *
   * @returns {Boolean}
   */
  isJson (): boolean {
    return Str(
      this.header('content-type')
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for a JSON response.
   *
   * @returns {Boolean}
   */
  wantsJson (): boolean {
    return Str(
      this.header('accept')
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for an HTML response.
   *
   * @returns {Boolean}
   */
  wantsHtml (): boolean {
    return Str(
      this.header('accept')
    ).contains('text/html')
  }

  /**
   * Returns the request’s content mime type from the `Content-Type` header field.
   *
   * @example
   * ```
   * request.contentType()
   * ```
   */
  contentType (): string | undefined {
    return this.header('Content-Type')
  }

  /**
   * Determine whether the request contains any of the given content `types`.
   * This method compares the "Content-Type" header value with all of the
   * given `types` determining whether one of the content types matches.
   *
   * @example
   * ```
   * // Request with Content-Type: text/html; charset=utf-8
   * request.isContentType('text/html') // true
   * request.isContentType('text/html', 'application/json') // true
   * request.isContentType(['text/html', 'application/json'])  // true
   *
   * // Request with Content-Type: application/json
   * request.isContentType('json') // true
   * request.isContentType('application/*')  // true
   *
   * request.isContentType('json', 'html') // true
   * request.isContentType('html') // false
   * ```
   */
  isContentType (types: string[]): boolean
  isContentType (...types: string[]): boolean
  isContentType (...types: string[]|string[][]): boolean {
    return !!this.ctx.request.is(
      ([] as string[]).concat(...types)
    )
  }
}
