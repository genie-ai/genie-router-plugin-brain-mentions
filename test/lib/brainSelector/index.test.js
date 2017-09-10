/* global describe, it, beforeEach */
const assert = require('assert')
const decache = require('decache')

describe('brainSelector', function () {
  let brainSelector = null

  beforeEach(function () {
    decache('../../../lib/brainSelector') // Uncache brainSelector, for config values reset
    brainSelector = require('../../../lib/brainSelector')
  })

  it('should be an object with a start() function', function () {
    assert.ok(typeof brainSelector.start === 'function')
  })

  it('start() should return a promise', function () {
    let result = brainSelector.start({})

    assert.ok(typeof result.then === 'function')
    assert.ok(typeof result.catch === 'function')
  })

  it('should set default config values', function () {
    return brainSelector.start({})
      .then(function () {
        let config = brainSelector.getConfig()

        // the default values
        assert.equal(3, config.partsOfInputToCheck)
        assert.equal(0, Object.keys(config.aliases).length)
      })
      .catch(function (err) {
        throw new Error('No catch expected in promise: ' + err.message)
      })
  })

  it('should set the config values', function () {
    return brainSelector.start({aliases: {exampleBrain: true}, partsOfInputToCheck: 4})
      .then(function () {
        let config = brainSelector.getConfig()

        // the default values
        assert.equal(4, config.partsOfInputToCheck)
        assert.deepEqual({exampleBrain: true}, config.aliases)
      })
      .catch(function (err) {
        throw new Error('No catch expected in promise: ' + err.message)
      })
  })

  it('should not accept invalid config values', function () {
    let testdata = [
     {aliases: 'string', partsOfInputToCheck: '4'},
     {aliases: []},
     {aliases: true}
    ]
    testdata.forEach(function (data) {
      decache('../../../lib/brainSelector') // Uncache brainSelector, for config values reset
      const brainSelector = require('../../../lib/brainSelector')
      brainSelector.start(data)
      .then(function () {
        let config = brainSelector.getConfig()

        // the default values
        assert.equal(3, config.partsOfInputToCheck)
        assert.deepEqual({}, config.aliases)
      })
      .catch(function (err) {
        throw new Error('No catch expected in promise: ' + err.message)
      })
    })
  })

  it('should detect the brain in these sentences', function () {
    let brains = {mybrain: 'mybrain', yourbrain: 'yourbrain'}
    let inputs = [
      ['ask mybrain what is the weather', 'mybrain', 'what is the weather'],
      ['yourbrain i want more info', 'yourbrain', 'i want more info'],
      ['frage mybrain was ist das Wetter?', 'mybrain', 'was ist das Wetter?'],
      ['vraag yourbrain een slimme vraag', 'yourbrain', 'een slimme vraag']
    ]

    let promises = []
    brainSelector.start({})
      .then(function (selector) {
        inputs.forEach(function (input) {
          promises.push(
            selector(brains, {message: {input: input[0]}})
              .then(function (result) {
                assert.equal(input[1], result.brain)
                assert.equal(input[2], result.input.message.input)
              })
          )
        })
      })

    return Promise.all(promises)
  })

  it('should detect an alias in these sentences', function () {
    let brains = {mybrain: 'mybrain', yourbrain: 'yourbrain'}
    let inputs = [
      ['ask charlie what is the weather', 'mybrain', 'what is the weather'],
      ['chuck i want more info', 'yourbrain', 'i want more info'],
      ['frage charlie was ist das Wetter?', 'mybrain', 'was ist das Wetter?'],
      ['vraag chuck een slimme vraag', 'yourbrain', 'een slimme vraag']
    ]

    let promises = []

    brainSelector.start({aliases: {charlie: 'mybrain', chuck: 'yourbrain'}})
      .then(function (selector) {
        inputs.forEach(function (input) {
          promises.push(
            selector(brains, {message: {input: input[0]}})
              .then(function (result) {
                assert.equal(input[1], result.brain)
                assert.equal(input[2], result.input.message.input)
              })
            )
        })
      })

    return Promise.all(promises)
  })

  it('should reject the promise when no match is found.', function () {
    return brainSelector.start({})
      .then(function (selector) {
        selector([], {message: {input: 'there is not going to be a match here'}})
          .then(function (result) {
            assert.ok(false, 'Not supposed to get here')
          })
          .catch(function (err) {
            assert.equal('No brain or alias match.', err.message)
          })
      })
  })
})
