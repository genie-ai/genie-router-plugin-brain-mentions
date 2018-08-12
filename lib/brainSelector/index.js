const debug = require('debug')('genie-router-plugin-brain-mentions');

let aliases = {};
let partsOfInputToCheck = 3;

/**
 * @private
 * @param {object} The input object.
 * @param {number} wordPosition The position the word was found.
 * @return {object} The updated input object.
 */
function getUpdatedInput(input, wordPosition) {
    const newInput = JSON.parse(JSON.stringify(input)); // Clone the input.

    // First split the entire sentence, remove the part up including the detected word
    // and reassemble again.
    newInput.message.input = input.message.input.split(' ').slice(wordPosition + 1).join(' ');
    return newInput;
}

async function brainSelector(brains, input) {
    const parts = input.message.input.split(' ').slice(0, partsOfInputToCheck);

    for (let iter = 0; iter < parts.length; iter += 1) {
        const inputWord = parts[iter];
        if (brains[inputWord]) {
            debug('Found', inputWord, 'at start of input');
            return { brain: brains[inputWord], input: getUpdatedInput(input, iter) };
        }

        if (aliases[inputWord] && brains[aliases[inputWord]]) {
            const aliasedBrain = aliases[inputWord];
            debug('Found alias', inputWord, 'for', aliasedBrain, 'in input.');
            return { brain: brains[aliasedBrain], input: getUpdatedInput(input, iter) };
        }
    }

    throw new Error('No brain or alias match.');
}

async function start(config) {
    if (typeof config.aliases === 'object') {
        debug('Setting aliases for brain mentions', config.aliases);
        aliases = config.aliases; // eslint-disable-line prefer-destructuring
    }
    if (typeof config.partsOfInputToCheck === 'number') {
        partsOfInputToCheck = config.partsOfInputToCheck; // eslint-disable-line prefer-destructuring
    }
    return brainSelector;
}

/**
 * The purpose is for unit testing, to check if the config is read properly.
 * @return {object}
 */
function getConfig() {
    return { aliases, partsOfInputToCheck };
}

module.exports = { start, getConfig };
