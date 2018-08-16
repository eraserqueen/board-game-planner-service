const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');


describe('db', () => {

    const dbFile = path.join(__dirname, 'db.test.json')
    const db = require('../src/db')(dbFile);

    beforeEach(() => {
        db.init();
        db.clear();
    });

    describe('register', () => {
        it('stores hashed password and returns user object', () => {

            const response = db.register('Alice', 'password');
            expect(response).to.eql({name:'Alice', avatar: ''});

            const storage = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
            expect(storage.players.length).to.equal(1);
            expect(storage.players[0].salt).to.exist;
            expect(storage.players[0].hash).to.exist;
        });
        it('returns error when user name already exists', () => {
            const first = db.register('Alice', 'password');
            expect(first).to.eql({name:'Alice', avatar: ''});

            const second = db.register('Alice', 'otherPassword');
            expect(second).to.eql({status:409, error: 'username already exists'});

            const result = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
            expect(result.players.length).to.equal(1);

        });
        it('returns error when password is empty', () => {
            const response = db.register('Alice', '');
            expect(response).to.eql({status:400, error: 'password cannot be empty'});

        });
    });

    describe('authenticate', () => {
        it('returns error when user is not found', () => {
            const result = db.authenticate('InvalidUserName', 'irrelevantPassword');
            expect(result).to.eql({status:404, error: 'invalid username or password'});
        });
        it('returns user when hash matches', () => {
            db.register('Alice', 'secretPassword');
            const result = db.authenticate('Alice', 'secretPassword');
            expect(result).to.eql({ name: 'Alice', avatar: '' });
        });
        it("returns error when hash doesn't match", () => {
            db.register('Alice', 'secretPassword');
            const result = db.authenticate('Alice', 'invalidPassword');
            expect(result).to.eql({status:404, error: 'invalid username or password'});
        });
    });
});