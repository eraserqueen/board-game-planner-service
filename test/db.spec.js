const path = require('path');
const fs = require('fs');
const {USER_NOT_FOUND, USER_CONFLICT} = require("../src/errorMessages");


describe('db', () => {

    const dbFile = path.join(__dirname, '../data/testDB.json')
    const db = require('../src/db')(dbFile);

    beforeAll((done) => {
        fs.writeFile(dbFile, null, null, done);
    });
    afterAll((done) => {
        fs.unlink(dbFile, done);
    });
    beforeEach(() => {
        db.init();
        db.clear();
    });

    describe('addNewUser', () => {
        test('stores hashed password and returns user object', async () => {

            const response = await db.addNewUser('Alice', 'password');
            expect(response).toEqual({name: 'Alice', avatar: ''});

            const storage = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
            expect(storage.players.length).toBe(1);
            expect(storage.players[0].salt).toBeDefined();
            expect(storage.players[0].hash).toBeDefined();
        });
        test('returns error when user name already exists', async () => {
            const result = await db.addNewUser('Alice', 'password')
                .then(() => db.addNewUser('Alice', 'otherPassword'))
                .catch(err => err);
            expect(result).toEqual(USER_CONFLICT);
        });
    });

    describe('findUser', () => {
        test('returns error when user is not found', async () => {
            const result = await db.findUser('InvalidUserName', 'irrelevantPassword')
                .catch(err => err);
            expect(result).toEqual(USER_NOT_FOUND);
        });
        test('returns user when hash matches', async () => {
            const result = await db.addNewUser('Alice', 'secretPassword').then(() => db.findUser('Alice', 'secretPassword'));
            expect(result).toEqual({name: 'Alice', avatar: ''});
        });
        test("returns error when hash doesn't match", async () => {
            const result = await db.addNewUser('Alice', 'secretPassword')
                .then(() => db.findUser('Alice', 'invalidPassword'))
                .catch(err => err);
            expect(result).toEqual(USER_NOT_FOUND);
        });
    });
});