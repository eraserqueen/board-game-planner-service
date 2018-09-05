const client = require('../firebaseDbClient');
const pattern = require("../../utils/uuid").pattern;

describe('Firebase DB client', () => {
    const gamesList = [
        {
            "id": "c28a30f2-1ef9-4575-a12c-8c03d5dac2d2",
            "title": "Dominion",
            "ownedBy": [ "Dom"]
        },
        {
            "id": "517be091-66bf-4f1d-8738-92b7ef0f48c0",
            "title": "Evolution",
            "ownedBy": [ "Dom"]
        },
        {
            "id": "cadf3fc1-3d29-4982-89bd-283378623fbf",
            "title": "Mechs vs Minions",
            "ownedBy": [ "Dom"]
        }];
    const firebaseGamesData = {
        "517be091-66bf-4f1d-8738-92b7ef0f48c0": {"title": "Evolution"},
        "c28a30f2-1ef9-4575-a12c-8c03d5dac2d2": {"title": "Dominion"},
        "cadf3fc1-3d29-4982-89bd-283378623fbf": {"title": "Mechs vs Minions"}
    };

    const user = {
        "hash": "hashed_password",
        "name": "Dom",
        "salt": "the_salt"
    };
    const event={
        "dateTimeStart": '2018-09-09T12:00:00',
        "dateTimeEnd": '2018-09-09T22:00:00',
    };

    beforeAll(() => {
        client._clearTestData();
    });
    afterAll(() => {
        client._closeConnection();
    });
    test('Player CRUD', async () => {
        const player = await client.addPlayer(user);
        expect(player).toEqual(user);

        await expect(client.getPlayer('Dom'))
            .resolves
            .toEqual(player);
    });
    test('Games CRUD', async () => {
        await expect(client.setGames(gamesList))
            .resolves
            .toEqual(gamesList);

        await expect(client.getGames())
            .resolves
            .toEqual(gamesList);
    });
    test('Events CRUD', async () => {
        const eventId = await client.addEvent(event);
        expect(eventId).toMatch(new RegExp(pattern));

        const eventWithId = {id: eventId, ...event};
        await expect(client.getEvent(eventId))
            .resolves
            .toEqual(eventWithId);

        await expect(client.getEvents()).resolves.toEqual([eventWithId]);
    });
});