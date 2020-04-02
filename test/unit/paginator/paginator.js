'use strict'

const BaseTest = require('../../../base-test')
const Paginator = require('../../../pagination')

class PaginatorTest extends BaseTest {
  async paginatorCreatesContextInformation (t) {
    const request = {
      path: '/posts',
      query: { page: 3 },
      info: { host: 'localhost' }
    }

    const pagination = new Paginator({ request, totalCount: 10, perPage: 2 })

    const expected = {
      total: 10,
      perPage: 2,
      currentPage: 3,
      lastPage: 5,
      first: 'http://localhost/posts?page=1',
      prev: 'http://localhost/posts?page=2',
      next: 'http://localhost/posts?page=4',
      last: 'http://localhost/posts?page=5',
      from: 4,
      to: 6,
      link: '<http://localhost/posts?page=1>; rel="first", <http://localhost/posts?page=2>; rel="prev", <http://localhost/posts?page=4>; rel="next", <http://localhost/posts?page=5>; rel="last"'
    }

    t.deepEqual(expected, pagination)
  }

  async generatesCorrectLinks (t) {
    const request = {
      path: '/posts',
      query: { page: 1 },
      info: { host: 'localhost' }
    }

    const pagination = new Paginator({ request, totalCount: 2, perPage: 5 })

    const expected = {
      total: 2,
      perPage: 5,
      currentPage: 1,
      lastPage: 1,
      first: undefined,
      prev: undefined,
      next: undefined,
      last: undefined,
      from: 0,
      to: 5,
      link: ''
    }

    t.deepEqual(expected, pagination)
  }

  async defaultsToFirstPage (t) {
    const request = {
      path: '/posts',
      query: { },
      info: { host: 'localhost' }
    }

    const pagination = new Paginator({ request, totalCount: 2, perPage: 5 })

    const expected = {
      total: 2,
      perPage: 5,
      currentPage: 1,
      lastPage: 1,
      first: undefined,
      prev: undefined,
      next: undefined,
      last: undefined,
      from: 0,
      to: 5,
      link: ''
    }

    t.deepEqual(expected, pagination)
  }

  async failsWithoutRequest (t) {
    const error = t.throws(() => new Paginator({ totalCount: 10 }))
    t.true(String(error.message).includes('required parameter'))
  }

  async failsWithRequestNull (t) {
    const error = t.throws(() => new Paginator({ request: null, totalCount: 10 }))
    t.true(String(error.message).includes('required parameter'))
  }

  async failsWithoutTotalCount (t) {
    const error = t.throws(() => new Paginator({ request: {} }))
    t.true(String(error.message).includes('required parameter'))
  }

  async failsWithTotalCountNull (t) {
    const error = t.throws(() => new Paginator({ request: {}, totalCount: null }))
    t.true(String(error.message).includes('required parameter'))
  }
}

module.exports = new PaginatorTest()
