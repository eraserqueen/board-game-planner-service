const fs = require('fs');
const db = require('../db');

const {USER_NOT_FOUND, USER_CONFLICT} = require("../../errorMessages");

describe('db', () => {

    beforeAll((done) => {
        fs.writeFile(db.getDbFilePath(), null, null, done);
    });
    afterAll((done) => {
        fs.unlink(db.getDbFilePath(), done);
    });
    beforeEach(() => {
        db.init();
        db.clear();
    });

    describe('addNewUser', () => {
        test('stores hashed password and returns user object', () => {

            expect(db.addNewUser('Alice', 'password')).toEqual({name: 'Alice', avatar: ''});

            const storage = JSON.parse(fs.readFileSync(db.getDbFilePath(), 'utf-8'));
            expect(storage.players.length).toBe(1);
            expect(storage.players[0].salt).toBeDefined();
            expect(storage.players[0].hash).toBeDefined();
        });
        test('returns error when user name already exists', () => {
            expect(db.addNewUser('Alice', 'password')).toEqual({name: 'Alice', avatar: ''});
            expect(() => db.addNewUser('Alice', 'otherPassword')).toThrowError(USER_CONFLICT);
        });
    });

    describe('findUser', () => {
        test('returns error when user is not found', () => {
            expect(() => db.findUser('InvalidUserName', 'irrelevantPassword')).toThrowError(USER_NOT_FOUND);
        });
        test('returns user when hash matches', () => {
            db.addNewUser('Alice', 'secretPassword');
            expect(db.findUser('Alice', 'secretPassword')).toEqual({name: 'Alice', avatar: ''});
        });
        test("returns error when hash doesn't match", () => {
            db.addNewUser('Alice', 'secretPassword');
            expect(() => db.findUser('Alice', 'invalidPassword')).toThrowError(USER_NOT_FOUND);
        });
    });
});