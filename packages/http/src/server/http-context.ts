'use strict'

import { RouterContext } from '@koa/router'
import { InteractsWithState } from './interacts-with-state'
import { Application, HttpContext as HttpContextContract, HttpRequest, HttpResponse, CookieOptions, ViewEngine, HttpResponseCtor, HttpRequestCtor } from '@supercharge/contracts'

export class HttpContext extends InteractsWithState implements HttpContextContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * Create a new HTTP context instance.
   *
   * @param {RouterContext} ctx
   * @param {Application} app
   */
  constructor (ctx: RouterContext, app: Application) {
    super(ctx)

    this.app = app
  }

  /**
   * Returns a wrapped HTTP context for the raw Koa HTTP `ctx`.
   *
   * @param {RouterContext} ctx
   * @param {Application} app
   *
   * @returns {HttpContext}
   */
  static wrap (ctx: RouterContext, app: Application): HttpContext {
    return new this(ctx, app)
  }

  /**
   * Returns the raw Koa HTTP context instance.
   *
   * @returns {RouterContext}
   */
  get raw (): RouterContext {
    return this.koaCtx
  }

  /**
   * Returns the HTTP request instance.
   *
   * @returns {HttpRequest}
   */
  get request (): HttpRequest {
    /**
     * We’re retrieving the Request constructor from the container because
     * the request is macroable. That means, packages may decorate the
     * request with custom methods. And we want to allow that easily.
     */
    const Request = this.app.make<HttpRequestCtor>('request')

    return new Request(this, this.cookieOptions())
  }

  /**
   * Returns the HTTP response instance.
   *
   * @returns {HttpResponse}
   */
  get response (): HttpResponse {
    /**
     * We’re retrieving the Response constructor from the container because
     * the response is macroable. That means, packages may decorate the
     * response with custom methods. And we want to allow that easily.
     */
    const Response = this.app.make<HttpResponseCtor>('response')

    return new Response(
      this, this.app.make<ViewEngine>('view'), this.cookieOptions()
    )
  }

  /**
   * Returns the default cookie options.
   *
   * @returns {CookieOptions}
   */
  private cookieOptions (): CookieOptions {
    return this.app.config().get('http.cookie')
  }
}
