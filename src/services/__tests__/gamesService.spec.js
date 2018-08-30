jest.mock('../../services/authService');
jest.mock('../../services/userService');
jest.mock('../../clients/bggClient');
jest.mock('../../utils/bggAdapter');

const bggClient = require('../../clients/bggClient');
const bggAdapter = require('../../utils/bggAdapter');
const dbClientMock = require('../../clients/__mocks__/dbClient');

describe('Games Service', () => {

    describe('synchronizeUserCollection', () => {
        test('rejects promise when bggClient failed', async () => {
            bggClient.getCollectionAsync = jest.fn().mockRejectedValue('something horrible happened');
            const gamesService = require("../gamesService")(dbClientMock);

            await expect(gamesService.synchronizeUserCollection('you')).rejects.toEqual('something horrible happened');

            expect(bggAdapter.mapCollectionToGamesList).not.toHaveBeenCalled();
            expect(dbClientMock.getGames).not.toHaveBeenCalled();
            expect(dbClientMock.setGames).not.toHaveBeenCalled();
        });
        [
            {
                scenario: 'when user collection contains game that is not already in list',
                oldGamesList: [],
                userCollection: [
                    {title: 'bbbbbb'},
                ],
                updatedGamesList: [
                    {title: 'bbbbbb', ownedBy: ['you']},
                ]
            },
            {
                scenario: 'when user collection contains a game from the list not yet owned by user',
                oldGamesList: [
                    {title: 'aaaaaa', ownedBy: ['notyou']},
                ],
                userCollection: [
                    {title: 'aaaaaa'},
                ],
                updatedGamesList: [
                    {title: 'aaaaaa', ownedBy: ['notyou', 'you']},
                ]
            },
            {
                scenario: 'when user collection does not contain a game from the list owned solely by user',
                oldGamesList: [
                    {title: 'aaaaaa', ownedBy: ['you']},
                    {title: 'bbbbbb', ownedBy: ['you']},
                ],
                userCollection: [
                    {title: 'bbbbbb'},
                ],
                updatedGamesList: [
                    {title: 'bbbbbb', ownedBy: ['you']},
                ]
            },
            {
                scenario: 'when user collection does not contain a game from the list solely owned by someone else',
                oldGamesList: [
                    {title: 'aaaaaa', ownedBy: ['notyou']},
                ],
                userCollection: [],
                updatedGamesList: [
                    {title: 'aaaaaa', ownedBy: ['notyou']},
                ]
            },
            {
                scenario: 'when user collection does not contain a game from the list owned by user and someone else',
                oldGamesList: [
                    {title: 'aaaaaa', ownedBy: ['you', 'notyou']},
                ],
                userCollection: [],
                updatedGamesList: [
                    {title: 'aaaaaa', ownedBy: ['notyou']},
                ]
            }
        ].forEach(({scenario, oldGamesList, userCollection, updatedGamesList}) =>
            test(scenario, async () => {
                bggClient.getCollectionAsync = jest.fn().mockResolvedValue({});
                bggAdapter.mapCollectionToGamesList = jest.fn().mockReturnValue(userCollection);
                dbClientMock.getGames.mockReturnValue(oldGamesList);
                const gamesService = require('../gamesService')(dbClientMock);
                await expect(gamesService.synchronizeUserCollection('you')).resolves.toEqual(updatedGamesList);


                expect(bggAdapter.mapCollectionToGamesList).toHaveBeenCalled();
                expect(dbClientMock.getGames).toHaveBeenCalled();
                expect(dbClientMock.setGames).toHaveBeenCalledWith(updatedGamesList);
            })
        );
    });
});