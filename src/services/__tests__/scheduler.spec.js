const scheduler = require("../scheduler");

describe('Scheduler', () => {
    describe('run', () => {
        test(
            'should return an empty array when playerPreferences are empty',
            () => {
                expect(scheduler.run({})).toEqual([]);
            }
        );
        test(
            'should return user preferences when event has only one participant',
            () => {
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
                expect(scheduler.run({playerPreferences})).toEqual(expected);
            }
        );
        test('should return schedule when playerPreferences are provided', () => {
           const playerPreferences = [
               { playerName: 'Arthur', order:1, gameId: 'Dominion'},
               { playerName: 'Arthur', order:2, gameId: 'Pandemic'},
               { playerName: 'Arthur', order:3, gameId: 'Splendor'},
               { playerName: 'Betty', order:1, gameId: 'Dominion'},
               { playerName: 'Betty', order:2, gameId: 'Evolution'},
               { playerName: 'Betty', order:3, gameId: 'Pandemic'},
               { playerName: 'Charlie', order:1, gameId: 'Dominion'},
               { playerName: 'Charlie', order:2, gameId: 'Evolution'},
               { playerName: 'Charlie', order:3, gameId: 'Eldorado'},
           ];
           const expected = [
               {order:1, gameId:'Dominion'},
               {order:2, gameId:'Evolution'},
               {order:3, gameId:'Pandemic'},
           ];
           expect(scheduler.run({playerPreferences})).toEqual(expected);
        });
    });
});