jest.mock('lowdb');
jest.mock('path');
jest.mock('../../services/db');
jest.mock('../../services/auth');
jest.mock('../../clients/bggClient');
jest.mock('../../utils/bggAdapter');

const db = require('../db');
const bggClient = require('../../clients/bggClient');
const bggAdapter = require('../../utils/bggAdapter');
const user = require("../games");

describe('User Service', () => {

    describe('synchronizeUserCollection', () => {
        test('rejects promise when bggClient failed', async () => {
            bggClient.getCollectionAsync = jest.fn().mockRejectedValue('something horrible happened');

            await expect(user.synchronizeUserCollection('you')).rejects.toEqual('something horrible happened');

            expect(bggAdapter.mapCollectionToGamesList).not.toHaveBeenCalled();
            expect(db.getGamesList).not.toHaveBeenCalled();
            expect(db.setGamesList).not.toHaveBeenCalled();
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
                db.getGamesList = jest.fn().mockReturnValue(oldGamesList);
                db.setGamesList = jest.fn();

                await expect(user.synchronizeUserCollection('you')).resolves.toEqual(updatedGamesList);

                expect(bggAdapter.mapCollectionToGamesList).toHaveBeenCalled();
                expect(db.getGamesList).toHaveBeenCalled();
                expect(db.setGamesList).toHaveBeenCalledWith(updatedGamesList);
            })
        );
    });
});