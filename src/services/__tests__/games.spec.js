jest.mock('../../services/auth');
jest.mock('../../services/db');
jest.mock('../../clients/bggClient');
jest.mock('../../utils/bggAdapter');

const bggClient = require('../../clients/bggClient');
const bggAdapter = require('../../utils/bggAdapter');
const dbMock = require('../../services/db')();

describe('Games Service', () => {

    describe('synchronizeUserCollection', () => {
        test('rejects promise when bggClient failed', async () => {
            bggClient.getCollectionAsync = jest.fn().mockRejectedValue('something horrible happened');
            const gamesService = require("../games")(dbMock);

            await expect(gamesService.synchronizeUserCollection('you')).rejects.toEqual('something horrible happened');

            expect(bggAdapter.mapCollectionToGamesList).not.toHaveBeenCalled();
            expect(dbMock.getGamesList).not.toHaveBeenCalled();
            expect(dbMock.setGamesList).not.toHaveBeenCalled();
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
                dbMock.getGamesList.mockReturnValue(oldGamesList);
                const gamesService = require('../games')(dbMock);
                await expect(gamesService.synchronizeUserCollection('you')).resolves.toEqual(updatedGamesList);


                expect(bggAdapter.mapCollectionToGamesList).toHaveBeenCalled();
                expect(dbMock.getGamesList).toHaveBeenCalled();
                expect(dbMock.setGamesList).toHaveBeenCalledWith(updatedGamesList);
            })
        );
    });
});