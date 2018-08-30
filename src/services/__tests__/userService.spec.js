jest.mock('bcryptjs');

const bcrypt = require('bcryptjs');
const dbClientMock = require('../../clients/__mocks__/dbClient');
let service = require('../userService')(dbClientMock);
const {INVALID_CREDENTIALS, USER_NOT_FOUND, USER_CONFLICT} = require("../../errorMessages");

describe('User service', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        bcrypt.hashSync = jest.fn().mockReturnValue('hashed_password');
        bcrypt.genSaltSync = jest.fn().mockReturnValue('the_salt');
    });
    describe('checkCredentials', () => {
        test('throws error when user is not found', () => {
            expect(() => service.checkCredentials('InvalidUserName', 'irrelevantPassword')).toThrowError(INVALID_CREDENTIALS);
        });
        test('returns user when hash matches', () => {
            dbClientMock.getPlayer.mockReturnValue({name: 'Alice', hash: 'hashed_password', salt: 'the_salt'});

            expect(service.checkCredentials('Alice', 'secretPassword')).toEqual({name: 'Alice'});
        });
        test("throws error when hash doesn't match", () => {
            dbClientMock.getPlayer.mockReturnValue({name: 'Alice', hash: 'hashed_password', salt: 'the_salt'});
            bcrypt.hashSync = jest.fn().mockReturnValue('a_different_hash');

            expect(() => service.checkCredentials('Alice', 'invalidPassword')).toThrowError(INVALID_CREDENTIALS);
        });
    });
    describe('findUser', () => {
        test('returns sanitized player data when user is found', () => {
            dbClientMock.getPlayer.mockReturnValue({name: 'Alice', hash: 'hashed_password', salt: 'the_salt'});
            expect(service.findUser('Alice')).toEqual({name: 'Alice'});
        });
        test('throws error when user is not found', () => {
            dbClientMock.getPlayer.mockImplementation(() => {
                throw new Error(USER_NOT_FOUND);
            });
            expect(() => service.findUser('Alice')).toThrowError(USER_NOT_FOUND);
        });
    });
    describe('addNewUser', () => {
        test('encrypts password and returns created user', () => {

            expect(service.addNewUser('Alice', 'password')).toEqual({name: 'Alice', avatar: ''});
            expect(bcrypt.hashSync).toHaveBeenCalledWith('password', 'the_salt');
            expect(dbClientMock.addPlayer).toHaveBeenCalledWith({
                name: 'Alice',
                hash: 'hashed_password',
                salt: 'the_salt'
            });
        });
        test('throws error when user already exists', () => {
            dbClientMock.getPlayer.mockReturnValue({name: 'Alice', hash: 'hashed_password', salt: 'the_salt'});
            expect(() => service.addNewUser('Alice', 'password')).toThrowError(USER_CONFLICT);

        });
    });
});