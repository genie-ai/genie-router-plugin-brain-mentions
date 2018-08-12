/* global describe, it */
const assert = require('assert');
const brainSelector = require('../index.js');

describe('genie-router-plugin-brain-mentions', () => {
    it('returns a brainSelector function', () => {
        assert.ok(typeof brainSelector.brainSelector);
    });
});
