'use strict'

const _ = require('lodash')
const Path = require('path')
const Fs = require('../filesystem')
const Helper = require('../helper')
const EventEmitter = require('events')
const Collect = require('@supercharge/collections')

/**
 * The event dispatcher registers all events
 * with the assigned listeners to the event
 * emitter.
 */
class Dispatcher {
  /**
   * Initialize a new Dispatcher instance.
   */
  constructor () {
    this.emitter = new EventEmitter()

    this.eventsFolder = 'app/events'
    this.listenersFolder = 'app/listeners'
    this.coreEventListener = [
      require('./listeners/handle-system-exceptions')
    ]
  }

  /**
   * Load all events and listener files from the
   * file system. Assign user and system
   * listeners to the related events.
   */
  async discoverEventsAndListeners () {
    await this.registerUserEvents()
    await this.registerSystemEventListeners()
  }

  /**
   * Returns the list of events for which the
   * emitter has registered listeners.
   *
   * @returns {Array}
   */
  eventNames () {
    return this.emitter.eventNames()
  }

  /**
   * Returns the number of listeners listening
   * to the event named `eventName`.
   *
   * @param {String} eventName
   *
   * @returns {Integer}
   */
  listenerCount (eventName) {
    return this.emitter.listenerCount(eventName)
  }

  /**
   * Returns a copy of the array of listeners
   * for the event named `eventName`.
   *
   * @param {String} eventName
   *
   * @returns {Function}
   */
  listeners (eventName) {
    return this.emitter.listeners(eventName)
  }

  /**
   * Removes all listeners, or those
   * specified by `eventName`.
   *
   * @param {String} eventName
   *
   * @returns {EventEmitter}
   */
  removeAllListeners (eventName) {
    return this.emitter.removeAllListeners(eventName)
  }

  /**
   * Returns the current max listener value for
   * the emitter. This max value can be set
   * by emitter.setMaxListeners(n).
   *
   * @returns {Integer}
   */
  getMaxListeners () {
    return this.emitter.getMaxListeners()
  }

  /**
   * Modify event emitter limit of listeners for
   * a given event. The value can be set to
   * Infinity (or 0) to indicate unlimited.
   *
   * @param {Integer} n
   *
   * @returns {EventEmitter}
   */
  setMaxListeners (n) {
    return this.emitter.setMaxListeners(n)
  }

  /**
   * Adds a one-time `listener` function
   * for the event named `eventName`.
   *
   * @param {String} eventName
   * @param {Function} listener
   *
   * @returns {EventEmitter}
   */
  once (eventName, listener) {
    return this.emitter.once(eventName, listener)
  }

  /**
   * Adds the `listener` function to the
   * beginning of the listeners array
   * for the event named `eventName`.
   *
   * @param {String} eventName
   * @param {Function} listener
   *
   * @returns {EventEmitter}
   */
  prependListener (eventName, listener) {
    return this.emitter.prependListener(eventName, listener)
  }

  /**
   * Adds a one-time `listener` function for
   * the event named `eventName` to the
   * beginning of the listeners array.
   *
   * @param {String} eventName
   * @param {Function} listener
   *
   * @returns {EventEmitter}
   */
  prependOnceListener (eventName, listener) {
    return this.emitter.prependOnceListener(eventName, listener)
  }

  /**
   * Shortcut method for `Event.listen(eventName, handler)`.
   *
   * @param {String} eventName
   * @param {object} handler
   */
  on (eventName, handler) {
    this.listen(eventName, handler)
  }

  /**
   * Register a new event with listener without
   * using the class convention. This way
   * allows only a single listener per event.
   *
   * @param {String} eventName
   * @param {Object} handler
   */
  listen (eventName, handler) {
    if (!eventName) {
      throw new Error(
        'Event name missing. Pass an event name as the first parameter to "Event.listen(eventName, listener)".'
      )
    }

    if (!handler) {
      throw new Error(
        'Listener missing. Pass an event listener as the second parameter to "Event.listen(eventName, listener)".'
      )
    }

    this.addListener(eventName, handler)
  }

  /**
   * Fire an event.
   *
   * @param {String} event
   * @param  {...Mixed} data
   */
  fire (event, ...data) {
    if (typeof event === 'string') {
      this.emitter.emit(event, ...data)
    } else {
      this.emitter.emit(event.emit(), event)
    }
  }

  /**
   * Load all events from the file system.
   *
   * @returns {Object}
   */
  async loadEvents () {
    return this.loadFiles(this.eventsFolder)
  }

  /**
   * Load all listeners from the file system.
   *
   * @returns {Object}
   */
  async loadListeners () {
    return this.loadFiles(this.listenersFolder)
  }

  /**
   * Load event or listener files from there
   * related folder on the filesystem.
   *
   * @param {String} folder
   */
  async loadFiles (folder) {
    const location = Path.resolve(Helper.appRoot(), folder)

    return await Fs.exists(location)
      ? Fs.allFiles(location)
      : []
  }

  /**
   * Ensure that the given instance extends the
   * `Event` class.
   */
  ensureEvent (event) {
    if (Object.getPrototypeOf(event.constructor).name !== 'Event') {
      throw new Error(`Your event "${event.constructor.name}" must extend the "Event" utility`)
    }
  }

  /**
   * Ensure that the given instance extends the
   * `Listener` class.
   */
  ensureListener (listener) {
    if (Object.getPrototypeOf(listener.constructor).name !== 'Listener') {
      throw new Error(`Your event listener "${listener.constructor.name}" must extend the "Listener" utility`)
    }
  }

  /**
   * Register listeners that listen for events
   * emitted by the Node.js process.
   */
  async registerSystemEventListeners () {
    await Collect(this.coreEventListener)
      .map(Listener => {
        return new Listener()
      })
      .concat(
        await this.getSystemEventListeners()
      )
      .forEach(listener => {
        this.registerListeners(listener.on(), listener)
      })
  }

  /**
   * Find all event listeners for the given event.
   *
   * @param {String} eventName
   */
  async getListenersFor (eventName) {
    const listenerFiles = await this.loadListeners()

    return listenerFiles
      .map(listenerFile => {
        const Listener = this.resolve(listenerFile)
        const listener = new Listener()
        this.ensureListener(listener)

        return listener.on().includes(eventName) ? listener : null
      })
      .filter(listener => !!listener)
  }

  /**
   * Find all listeners of type `system`. All event
   * files in the app directory should return
   * the type `user`.
   */
  async getSystemEventListeners () {
    const listenerFiles = await this.loadListeners()

    return listenerFiles
      .map(listenerFile => {
        const Listener = this.resolve(listenerFile)
        const listener = new Listener()
        this.ensureListener(listener)

        return listener
      })
      .filter(listener => {
        return listener.type() === 'system'
      })
  }

  /**
   * Register user events and the assigned
   * listeners to the event emitter.
   */
  async registerUserEvents () {
    const eventFiles = await this.loadEvents()

    _.forEach(eventFiles, async eventFile => {
      const Event = this.resolve(eventFile)
      const event = new Event()
      this.ensureEvent(event)

      const listeners = await this.getListenersFor(event.emit())
      this.registerListeners(event.emit(), listeners)
    })
  }

  /**
   * Register the array of event listeners to
   * the event.
   *
   * @param {String} eventNames
   * @param {Array|Object} listeners
   */
  registerListeners (eventNames, listeners) {
    listeners = [].concat(listeners)
    const events = [].concat(eventNames)

    events.forEach(eventName => {
      listeners.forEach(listener => {
        listener.type() === 'user'
          ? this.addListener(eventName, listener.handle)
          : this.addSystemListener(eventName, listener.handle)
      })
    })
  }

  /**
   * Resolve the class from given `file` path.
   *
   * @param {String} file
   *
   * @returns {Function}
   */
  resolve (file) {
    return require(file)
  }

  /**
   * Add an event `listener` to the given
   * `eventName`.
   *
   * @param {String} eventName
   * @param {Object} listener
   */
  addListener (eventName, listener) {
    this.ensureMaxListenersCount(this.emitter, eventName)
    this.emitter.on(eventName, listener)
  }

  /**
   * Register an event listener for a Node.js event.
   *
   * @param {String} eventName
   * @param {Object} listener
   */
  async addSystemListener (eventName, listener) {
    this.ensureMaxListenersCount(process, eventName)
    process.on(eventName, listener)
  }

  /**
   * Checks and (if necessary) updates the
   * max listeners count.
   *
   * @param {Object} emitter
   * @param {String} eventName
   */
  ensureMaxListenersCount (emitter, eventName) {
    const maxListeners = emitter.getMaxListeners()
    const listenerCount = emitter.listenerCount(eventName)

    if (listenerCount >= maxListeners) {
      emitter.setMaxListeners(listenerCount + 10)
    }
  }

  /**
   * Remove `listener` from the given `event`.
   * This removes only user listeners, because
   * system listeners can’t be turned off.
   *
   * @param {String} event
   * @param {Object} listener
   */
  off (eventName, handler) {
    this.forget(eventName, handler)
  }

  /**
   * Remove `listener` from the given `event`.
   * This removes only user listeners, because
   * system listeners can’t be turned off.
   *
   * @param {String} event
   * @param {Function} listener
   */
  forget (event, listener) {
    const events = Array.isArray(event) ? event : [event]

    _.forEach(events, eventName => {
      this.emitter.removeListener(eventName, listener)
    })
  }
}

module.exports = new Dispatcher()
