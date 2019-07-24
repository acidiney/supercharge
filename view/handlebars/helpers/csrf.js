'use strict'

const _ = require('lodash')
const Handlebars = require('handlebars')
const Config = require('../../../config')

/**
 * Generates a CSRF token hidden input form field.
 *
 * @returns {String} HTML
 */
function csrf (context) {
  const tokenName = Config.get('session.token')
  const token = _.get(context, `data.root.${tokenName}`)

  if (token) {
    return new Handlebars.SafeString(`<input type="hidden" name="${tokenName}" value="${token}">`)
  }

  return ''
}

module.exports = csrf
