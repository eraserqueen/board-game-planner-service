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
            db.findUser.mockReturnValue({name: 'user', avatar: 'data/image:32478odshfduewhfiw'});
            auth.getToken.mockReturnValue('a_valid_token');

            userController.auth({body: {username: 'user', password: 'pass'}}, res);

            expect(db.findUser).toHaveBeenCalledWith('user', 'pass');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith({
                user: {name: 'user', avatar: 'data/image:32478odshfduewhfiw'},
                token: 'a_valid_token'
            });
        });
    });
});