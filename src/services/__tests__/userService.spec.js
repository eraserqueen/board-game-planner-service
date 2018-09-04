jest.mock('bcryptjs');

const bcrypt = require('bcryptjs');
const dbClientMock = require('../../clients/__mocks__/dbClient');
const service = require('../userService')(dbClientMock);
const {INVALID_CREDENTIALS, USER_NOT_FOUND, USER_CONFLICT} = require("../../errorMessages");


describe('User service', () => {

    const userData = {
        name: 'Alice',
        hash: 'hashed_password',
        salt: 'the_salt'
    };
    const mockUserExists = () => dbClientMock.getPlayer.mockResolvedValue(userData);
    const mockUserNotFound = () => dbClientMock.getPlayer.mockResolvedValue(null);

    beforeEach(() => {
        jest.resetAllMocks();
        bcrypt.hashSync = jest.fn().mockReturnValue(userData.hash);
        bcrypt.genSaltSync = jest.fn().mockReturnValue(userData.salt);
    });
    describe('checkCredentials', () => {
        test('throws error when user is not found', () => {
            mockUserNotFound();
            const actual = service.checkCredentials('InvalidUserName', 'irrelevantPassword');
            return expect(actual).rejects.toEqual(new Error(INVALID_CREDENTIALS));
        });
        test('returns user when hash matches', () => {
            mockUserExists();

            let actual = service.checkCredentials('Alice', 'secretPassword');
            return expect(actual).resolves.toEqual({name: 'Alice'});
        });
        test("throws error when hash doesn't match", () => {
            mockUserExists();
            bcrypt.hashSync = jest.fn().mockReturnValue('a_different_hash');

            const actual = service.checkCredentials('Alice', 'invalidPassword');
            return expect(actual).rejects.toEqual(new Error(INVALID_CREDENTIALS));
        });
    });
    describe('findUser', () => {
        test('returns sanitized player data when user is found', () => {
            mockUserExists();
            return expect(service.findUser('Alice')).resolves.toEqual({name: 'Alice'});
        });
        test('throws error when user is not found', () => {
            mockUserNotFound();
            return expect(service.findUser('Alice')).rejects.toEqual(new Error(USER_NOT_FOUND));
        });
    });
    describe('addNewUser', () => {
        test('encrypts password and returns created user with sanitized data', async () => {
            mockUserNotFound();
            dbClientMock.addPlayer.mockResolvedValue(userData);

            const actual = await service.addNewUser('Alice', 'password');

            expect(dbClientMock.getPlayer).toHaveBeenCalledWith('Alice');
            expect(bcrypt.hashSync).toHaveBeenCalledWith('password', 'the_salt');
            expect(dbClientMock.addPlayer).toHaveBeenCalledWith(userData);
            expect(actual).toEqual({name: 'Alice', avatar: ''});
        });
        test('throws error when user already exists', () => {
            mockUserExists();

            const actual = service.addNewUser('Alice', 'password');
            return expect(actual).rejects.toEqual(new Error(USER_CONFLICT))

        });
        test('throws error when user creation failed', () => {
            mockUserNotFound();
            dbClientMock.addPlayer.mockRejectedValue(new Error('could not write to db'))

            const actual = service.addNewUser('Alice', 'password');
            return expect(actual).rejects.toEqual(new Error('could not write to db'))

        });
    });
});