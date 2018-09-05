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
            expect(dbClientMock.getGames).toHaveBeenCalled();
            expect(dbClientMock.setGames).not.toHaveBeenCalled();
        });
        [
            {
                scenario: 'when user collection contains game that is not already in list',
                oldGamesList: [],
                userCollection: [
                    {id: 'bbbbbb'},
                ],
                updatedGamesList: [
                    {id: 'bbbbbb', ownedBy: ['you']},
                ]
            },
            {
                scenario: 'when user collection contains a game from the list not yet owned by user',
                oldGamesList: [
                    {id: 'aaaaaa', ownedBy: ['notyou']},
                ],
                userCollection: [
                    {id: 'aaaaaa'},
                ],
                updatedGamesList: [
                    {id: 'aaaaaa', ownedBy: ['notyou', 'you']},
                ]
            },
            {
                scenario: 'when user collection does not contain a game from the list owned solely by user',
                oldGamesList: [
                    {id: 'aaaaaa', ownedBy: ['you']},
                    {id: 'bbbbbb', ownedBy: ['you']},
                ],
                userCollection: [
                    {id: 'bbbbbb'},
                ],
                updatedGamesList: [
                    {id: 'bbbbbb', ownedBy: ['you']},
                ]
            },
            {
                scenario: 'when user collection does not contain a game from the list solely owned by someone else',
                oldGamesList: [
                    {id: 'aaaaaa', ownedBy: ['notyou']},
                ],
                userCollection: [],
                updatedGamesList: [
                    {id: 'aaaaaa', ownedBy: ['notyou']},
                ]
            },
            {
                scenario: 'when user collection does not contain a game from the list owned by user and someone else',
                oldGamesList: [
                    {id: 'aaaaaa', ownedBy: ['you', 'notyou']},
                ],
                userCollection: [],
                updatedGamesList: [
                    {id: 'aaaaaa', ownedBy: ['notyou']},
                ]
            }
        ].forEach(({scenario, oldGamesList, userCollection, updatedGamesList}) =>
            test(scenario, async () => {
                dbClientMock.getGames.mockResolvedValue(oldGamesList);
                bggClient.getCollectionAsync = jest.fn().mockResolvedValue('not used');
                bggAdapter.mapCollectionToGamesList = jest.fn().mockReturnValue(userCollection);
                bggAdapter.convertThumbnailToDataUri = jest.fn().mockImplementation(game => game);
                dbClientMock.setGames.mockResolvedValue(updatedGamesList);

                const gamesService = require('../gamesService')(dbClientMock);
                await expect(gamesService.synchronizeUserCollection('you')).resolves.toEqual(updatedGamesList);

                expect(bggAdapter.mapCollectionToGamesList).toHaveBeenCalled();
                expect(dbClientMock.getGames).toHaveBeenCalled();
                expect(dbClientMock.setGames).toHaveBeenCalledWith(updatedGamesList);
            })
        );
    });
});