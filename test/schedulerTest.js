const assert = require('assert');

const scheduler = require("../src/scheduler");

describe('Scheduler', function () {
    describe('run', function () {
        it('should return an empty array when playerPreferences are empty', function () {
            assert.deepStrictEqual(scheduler.run({}), []);
        });
        it('should return user preferences when event has only one participant', function () {
            const playerPreferences = [
                {
                    "playerName": "Dom",
                    "order": 1,
                    "gameId": "a6cde340-173e-4f8a-af6f-f6a08ea1e23a"
                },
                {
                    "playerName": "Dom",
                    "order": 2,
                    "gameId": "a71a8769-3bc0-4d3c-b144-2acba9d5468d"
                },
                {
                    "playerName": "Dom",
                    "order": 3,
                    "gameId": "8669904c-4e77-4db3-b01a-c1a9a712c7bd"
                }];
            const expected = [
                {
                    "order": 1,
                    "gameId": "a6cde340-173e-4f8a-af6f-f6a08ea1e23a"
                },
                {
                    "order": 2,
                    "gameId": "a71a8769-3bc0-4d3c-b144-2acba9d5468d"
                },
                {
                    "order": 3,
                    "gameId": "8669904c-4e77-4db3-b01a-c1a9a712c7bd"
                }];
            assert.deepStrictEqual(scheduler.run({playerPreferences}), expected);
        });
    });
});