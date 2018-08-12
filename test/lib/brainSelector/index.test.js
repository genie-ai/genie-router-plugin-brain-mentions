/* global describe, it, beforeEach */
const assert = require('assert');
const decache = require('decache');

describe('brainSelector', () => {
    let brainSelector = null;

    beforeEach(() => {
        decache('../../../lib/brainSelector'); // Uncache brainSelector, for config values reset
        brainSelector = require('../../../lib/brainSelector'); // eslint-disable-line global-require
    });

    it('should be an object with a start() function', () => {
        assert.ok(typeof brainSelector.start === 'function');
    });

    it('start() should return a promise', () => {
        const result = brainSelector.start({});

        assert.ok(typeof result.then === 'function');
        assert.ok(typeof result.catch === 'function');
    });

    it('should set default config values', async () => {
        await brainSelector.start({});
        const config = brainSelector.getConfig();

        // the default values
        assert.equal(3, config.partsOfInputToCheck);
        assert.equal(0, Object.keys(config.aliases).length);
    });

    it('should set the config values', async () => {
        await brainSelector.start({ aliases: { exampleBrain: true }, partsOfInputToCheck: 4 });
        const config = brainSelector.getConfig();

        // the default values
        assert.equal(4, config.partsOfInputToCheck);
        assert.deepEqual({ exampleBrain: true }, config.aliases);
    });

    it('should not accept invalid config values', () => {
        const testdata = [
            { aliases: 'string', partsOfInputToCheck: '4' },
            { aliases: [] },
            { aliases: true },
        ];
        testdata.forEach(async (data) => {
            decache('../../../lib/brainSelector'); // Uncache brainSelector, for config values reset
            const localBrainSelector = require('../../../lib/brainSelector'); // eslint-disable-line global-require
            await localBrainSelector.start(data);

            const config = brainSelector.getConfig();

            // the default values
            assert.equal(3, config.partsOfInputToCheck);
            assert.deepEqual({}, config.aliases);
        });
    });

    it('should detect the brain in these sentences', async () => {
        const brains = { mybrain: 'mybrain', yourbrain: 'yourbrain' };
        const inputs = [
            ['ask mybrain what is the weather', 'mybrain', 'what is the weather'],
            ['yourbrain i want more info', 'yourbrain', 'i want more info'],
            ['frage mybrain was ist das Wetter?', 'mybrain', 'was ist das Wetter?'],
            ['vraag yourbrain een slimme vraag', 'yourbrain', 'een slimme vraag'],
        ];

        const promises = [];
        const selector = await brainSelector.start({});
        inputs.forEach((input) => {
            promises.push(
                selector(brains, { message: { input: input[0] } })
                    .then((result) => {
                        assert.equal(input[1], result.brain);
                        assert.equal(input[2], result.input.message.input);
                    }),
            );
        });

        return Promise.all(promises);
    });

    it('should detect an alias in these sentences', async () => {
        const brains = { mybrain: 'mybrain', yourbrain: 'yourbrain' };
        const inputs = [
            ['ask charlie what is the weather', 'mybrain', 'what is the weather'],
            ['chuck i want more info', 'yourbrain', 'i want more info'],
            ['frage charlie was ist das Wetter?', 'mybrain', 'was ist das Wetter?'],
            ['vraag chuck een slimme vraag', 'yourbrain', 'een slimme vraag'],
        ];

        const promises = [];

        const selector = await brainSelector.start({ aliases: { charlie: 'mybrain', chuck: 'yourbrain' } });
        inputs.forEach((input) => {
            promises.push(
                selector(brains, { message: { input: input[0] } })
                    .then((result) => {
                        assert.equal(input[1], result.brain);
                        assert.equal(input[2], result.input.message.input);
                    }),
            );
        });

        return Promise.all(promises);
    });

    it('should reject the promise when no match is found.', async () => {
        const selector = await brainSelector.start({});
        try {
            await selector([], { message: { input: 'there is not going to be a match here' } });
            assert.ok(false, 'Not supposed to get here');
        } catch (err) {
            assert.equal('No brain or alias match.', err.message);
        }
    });
});
