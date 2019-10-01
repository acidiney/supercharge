'use strict'

const BaseTest = require('../../../../base-test')

class RawHelperTest extends BaseTest {
  async rawHelper (t) {
    const output = await this.render('{{{{raw}}}} {{name}} {{{{/raw}}}}', { name: 'Marcus' })
    t.is(output, ' {{name}} ')
  }
}

module.exports = new RawHelperTest()
