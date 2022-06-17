'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Container } = require('../dist')

test('throws for invalid namespace when binding an instance', () => {
  const container = new Container()

  expect(() => container.bind()).toThrow()
  expect(() => container.bind(null)).toThrow()
  expect(() => container.bind('', () => {})).toThrow()

  expect(() => container.bind({}, () => {})).not.toThrow()
  expect(container.hasBinding({})).toBe(true)

  expect(() => container.bind(123, () => {})).not.toThrow()
  expect(container.hasBinding(123)).toBe(true)

  expect(() => container.bind(true, () => {})).not.toThrow()
  expect(container.hasBinding(true)).toBe(true)
})

test('throws when missing the factory function when binding an instance', () => {
  const container = new Container()

  expect(() => container.bind('namespace')).toThrow()
})

test('bind (string namespace)', () => {
  const container = new Container()

  container.bind('namespace', () => 1)
  container.bind('namespace.binding', () => 2)
  container.bind('namespace/binding', () => 3)

  expect(container.hasBinding('namespace')).toBe(true)
  expect(container.hasBinding('namespace.binding')).toBe(true)
  expect(container.hasBinding('namespace/binding')).toBe(true)

  expect(container.isSingleton('namespace')).toBe(false)

  container.singleton('singleton', () => 1)
  container.singleton('singleton.binding', () => 2)
  container.singleton('namespace.binding', () => 2)

  expect(container.isSingleton('singleton')).toBe(true)
  expect(container.isSingleton('singleton.binding')).toBe(true)
  expect(container.isSingleton('namespace.binding')).toBe(true)
})

test('bind (class constructor as namespace)', () => {
  const container = new Container()

  container.bind(User, () => {
    return new User({ name: 'Supercharge' })
  })

  expect(container.hasBinding(User)).toBe(true)
  expect(container.make(User)).toEqual(new User({ name: 'Supercharge' }))
})

test('make', () => {
  const container = new Container()

  container.bind('namespace', () => 1)

  expect(container.make('namespace')).toBe(1)
})

test('throws when missing a binding', () => {
  const container = new Container()

  expect(() => {
    container.make('not-bound')
  }).toThrow('Missing container binding for the given namespace "not-bound"')
})

test('make singleton', () => {
  const container = new Container()

  container.singleton('singleton', () => {
    return new Singleton()
  })

  expect(container.make('singleton')).toBe(container.make('singleton'))
})

test('make class', () => {
  class User {
    constructor (app) {
      this.app = app
    }

    hello () { return 'hello' }
  }

  const container = new Container()
  const user = container.make(User)

  expect(user instanceof User).toBe(true)
  expect(user.app).toBe(container)
  expect(user.hello()).toBe('hello')
})

test('throws for missing namespace when binding a singleton', () => {
  const container = new Container()

  expect(() => container.singleton()).toThrow()
})

test('flush', () => {
  const container = new Container()

  container.bind('binding', () => 1)
  container.singleton('singleton', () => 1)

  expect(container.hasBinding('binding')).toBe(true)
  expect(container.isSingleton('singleton')).toBe(true)

  container.flush()

  expect(container.hasBinding('binding')).toBe(false)
  expect(container.isSingleton('singleton')).toBe(false)
})

test('alias with string keys', () => {
  const container = new Container()

  container
    .bind('namespace', () => 'concrete')
    .alias('namespace', 'alias')

  expect(container.make('alias')).toBe('concrete')
  expect(container.make('namespace')).toBe('concrete')
})

test('alias with class', () => {
  const container = new Container()

  container
    .bind(User, () => new User({ name: 'Supercharge' }))
    .alias(User, 'user')

  const alias = container.make('user')
  expect(alias).toBeInstanceOf(User)
  expect(alias).toEqual(new User({ name: 'Supercharge' }))

  const user = container.make(User)
  expect(alias).toEqual(user)
})

test('fails to create an alias for itself', () => {
  const container = new Container()

  expect(() => {
    container.alias('alias', 'alias')
  }).toThrow('"alias" is an alias for itself')

  expect(() => {
    container.alias(User, User)
  }).toThrow('"User" is an alias for itself')
})

class Singleton {}

class User {
  constructor (data) {
    this.data = data
  }
}

test.run()
