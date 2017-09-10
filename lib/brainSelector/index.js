const debug = require('debug')('genie-router-plugin-brain-mentions')
var aliases = {}
var partsOfInputToCheck = 3

function brainSelector (brains, input) {
  return new Promise(function (resolve, reject) {
    let parts = input.message.input.split(' ').slice(0, partsOfInputToCheck)

    for (let iter = 0; iter < parts.length; iter++) {
      let inputWord = parts[iter]
      if (brains[inputWord]) {
        debug('Found', inputWord, 'at start of input')
        resolve({brain: brains[inputWord], input: getUpdatedInput(input, iter)})
        return
      }

      if (aliases[inputWord] && brains[aliases[inputWord]]) {
        let aliasedBrain = aliases[inputWord]
        debug('Found alias', inputWord, 'for', aliasedBrain, 'in input.')
        resolve({brain: brains[aliasedBrain], input: getUpdatedInput(input, iter)})
        return
      }
    }

    reject(new Error('No brain or alias match.'))
  })
}

function start (config) {
  return new Promise(function (resolve, reject) {
    if (typeof config.aliases === 'object') {
      debug('Setting aliases for brain mentions', config.aliases)
      aliases = config.aliases
    }
    if (typeof config.partsOfInputToCheck === 'number') {
      partsOfInputToCheck = config.partsOfInputToCheck
    }
    resolve(brainSelector)
  })
}

/**
 * The purpose is for unit testing, to check if the config is read properly.
 * @return {object}
 */
function getConfig () {
  return {aliases: aliases, partsOfInputToCheck: partsOfInputToCheck}
}

/**
 * @private
 * @param {object} The input object.
 * @param {number} wordPosition The position the word was found.
 * @return {object} The updated input object.
 */
function getUpdatedInput (input, wordPosition) {
  let newInput = JSON.parse(JSON.stringify(input)) // Clone the input.

  // First split the entire sentence, remove the part up including the detected word
  // and reassemble again.
  newInput.message.input = input.message.input.split(' ').slice(wordPosition + 1).join(' ')
  return newInput
}

module.exports = {start: start, getConfig: getConfig}
