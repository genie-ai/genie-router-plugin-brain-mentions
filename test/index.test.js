/* global describe, it */
const assert = require('assert')

describe('genie-router-plugin-brain-mentions', function () {
  it('returns a brainSelector function', function () {
    let brainSelector = require('../index.js')
    assert.ok(typeof brainSelector.brainSelector)
  })
})
