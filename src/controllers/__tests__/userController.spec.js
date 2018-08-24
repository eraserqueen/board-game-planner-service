jest.mock('lowdb');
jest.mock('path');
jest.mock('../../services/db');
jest.mock('../../services/auth');
const db = require('../../services/db');
const auth = require('../../services/auth');
const userController = require('../userController');

describe('User Controller', () => {
    const resJsonMock = jest.fn();
    const res = {
        status: jest.fn().mockReturnValue({json: resJsonMock}),
    };

    describe('auth', () => {
        test('returns error when incoming request is malformed', () => {
            userController.auth({}, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(db.findUser).not.toHaveBeenCalled();
        });
        test('returns error when user credentials are invalid', () => {
            db.findUser.mockImplementation(() => {
                throw new Error('user not found');
            });

            userController.auth({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(db.findUser).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: 'user not found'});
        });
        test('generates JWT when user credentials are valid', () => {
            let user = {name: 'user', avatar: 'data/image:32478odshfduewhfiw'};
            db.findUser.mockReturnValue(user);
            auth.getToken.mockReturnValue('a_valid_token');

            userController.auth({body: {username: 'user', password: 'pass'}}, res);

            expect(db.findUser).toHaveBeenCalledWith('user', 'pass');
            expect(auth.getToken).toHaveBeenCalledWith(user);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith({
                user,
                token: 'a_valid_token'
            });
        });
    });
    describe('register', () => {
        test('returns error when incoming request is malformed', () => {
            userController.register({}, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(db.addNewUser).not.toHaveBeenCalled();
            expect(auth.getToken).not.toHaveBeenCalled();
        });
        test('returns error when registration failed', () => {
            db.addNewUser.mockImplementation(() => {
                throw new Error('user already exists');
            });

            userController.register({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(db.addNewUser).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(auth.getToken).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: 'user already exists'});
        });
        test('generates JWT when registration was successful', () => {
            let user = {name: 'user', avatar: 'data/image:32478odshfduewhfiw'};
            db.addNewUser.mockReturnValue(user);
            auth.getToken.mockReturnValue('a_valid_token');

            userController.register({body: {username: 'user', password: 'pass'}}, res);

            expect(db.addNewUser).toHaveBeenCalledWith('user', 'pass');
            expect(auth.getToken).toHaveBeenCalledWith(user);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith({
                user,
                token: 'a_valid_token'
            });
        });

    });
});