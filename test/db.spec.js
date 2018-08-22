const path = require('path');
const fs = require('fs');


describe('db', () => {

    const dbFile = path.join(__dirname, 'testDB.json')
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

    describe('register', () => {
        test('stores hashed password and returns user object', () => {

            const response = db.register('Alice', 'password');
            expect(response).toEqual({name:'Alice', avatar: ''});

            const storage = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
            expect(storage.players.length).toBe(1);
            expect(storage.players[0].salt).toBeDefined();
            expect(storage.players[0].hash).toBeDefined();
        });
        test('returns error when user name already exists', () => {
            const first = db.register('Alice', 'password');
            expect(first).toEqual({name:'Alice', avatar: ''});

            const second = db.register('Alice', 'otherPassword');
            expect(second).toEqual({status:409, error: 'username already exists'});

            const result = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
            expect(result.players.length).toBe(1);

        });
        test('returns error when password is empty', () => {
            const response = db.register('Alice', '');
            expect(response).toEqual({status:400, error: 'password cannot be empty'});

        });
    });

    describe('authenticate', () => {
        test('returns error when user is not found', () => {
            const result = db.authenticate('InvalidUserName', 'irrelevantPassword');
            expect(result).toEqual({status:404, error: 'invalid username or password'});
        });
        test('returns user when hash matches', () => {
            db.register('Alice', 'secretPassword');
            const result = db.authenticate('Alice', 'secretPassword');
            expect(result).toEqual({ name: 'Alice', avatar: '' });
        });
        test("returns error when hash doesn't match", () => {
            db.register('Alice', 'secretPassword');
            const result = db.authenticate('Alice', 'invalidPassword');
            expect(result).toEqual({status:404, error: 'invalid username or password'});
        });
    });
});