jest.mock('../src/auth');

describe('User', () => {
    describe('authenticate', () => {
        test('returns user with session token when user was found', () => {
            const user = require('../src/user')({
                findUser: jest.fn().mockReturnValue(Promise.resolve({name: 'Alice'}))
            });
            expect(user.authenticate('Alice', 'password')).resolves.toEqual({
                user: {name:'Alice'},
                token: 'MOCK_JSON_WEB_TOKEN'
            });
        });
        test('returns error when user was not found', () => {
            const user = require('../src/user')({
                findUser: jest.fn().mockReturnValue(Promise.reject('user not found'))
            });
            expect(user.authenticate('Alice', 'password')).resolves.toEqual({
                error: 'user not found'
            });
        });
    });
    describe('register', () => {
        test('returns new user with session token when user was registered successfully', () => {
            const user = require('../src/user')({
                addNewUser: jest.fn().mockReturnValue(Promise.resolve({name: 'Alice'}))
            });
            expect(user.register('Alice', 'password')).resolves.toEqual({
                user: {name:'Alice'},
                token: 'MOCK_JSON_WEB_TOKEN'
            });
        });
        test('returns error when user could not be registered', () => {
            const user = require('../src/user')({
                addNewUser: jest.fn().mockReturnValue(Promise.reject('user already exists'))
            });
            expect(user.register('Alice', 'password')).resolves.toEqual({
                error: 'user already exists'
            });
        });
    });
});