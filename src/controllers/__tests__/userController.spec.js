jest.mock('lowdb');
jest.mock('path');
jest.mock('../../services/db');
jest.mock('../../services/auth');
jest.mock('../../services/games');

const db = require('../../services/db');
const auth = require('../../services/auth');
const games = require('../../services/games');
const userController = require('../userController');

const {USER_CONFLICT, USER_NOT_FOUND} = require("../../errorMessages");


describe('User Controller', () => {
    const resJsonMock = jest.fn();
    const res = {
        status: jest.fn().mockReturnValue({json: resJsonMock}),
    };

    describe('auth', () => {
        [
            {},
            {username: 'user'},
            {password: 'password'}
        ].forEach(badRequest =>
            test('returns error when incoming request is malformed', () => {
                userController.auth(badRequest, res);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(db.checkCredentials).not.toHaveBeenCalled();
            })
        );
        test('returns error when user credentials are invalid', () => {
            db.checkCredentials.mockImplementation(() => {
                throw new Error('user not found');
            });

            userController.auth({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(db.checkCredentials).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: 'user not found'});
        });
        test('generates JWT when user credentials are valid', () => {
            let user = {name: 'user', avatar: 'data/image:32478odshfduewhfiw'};
            db.checkCredentials.mockReturnValue(user);
            auth.getToken.mockReturnValue('a_valid_token');

            userController.auth({body: {username: 'user', password: 'pass'}}, res);

            expect(db.checkCredentials).toHaveBeenCalledWith('user', 'pass');
            expect(auth.getToken).toHaveBeenCalledWith(user);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith({
                user,
                token: 'a_valid_token'
            });
        });
    });
    describe('register', () => {
        [
            {},
            {username: 'user'},
            {password: 'password'}
        ].forEach(badRequest =>
            test('returns error when incoming request is malformed', () => {
                userController.register(badRequest, res);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(db.addNewUser).not.toHaveBeenCalled();
                expect(auth.getToken).not.toHaveBeenCalled();
            })
        );
        test('returns error when registration failed', () => {
            db.addNewUser.mockImplementation(() => {
                throw new Error(USER_CONFLICT);
            });

            userController.register({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(db.addNewUser).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(auth.getToken).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: USER_CONFLICT});
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
    describe('getProfile', () => {
        test('returns error when user is not found', () => {
            db.findUser.mockImplementation(() => {
                throw new Error(USER_NOT_FOUND);
            });

            userController.getProfile({jwt: {username: 'Invalid'}}, res);

            expect(db.findUser).toHaveBeenCalledWith('Invalid');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: USER_NOT_FOUND});
        });
        test('returns user data', () => {
            const userData = {name: 'Valid', avatar: 'data/image;189d1duiiqeh389qh'};
            db.findUser.mockReturnValue(userData);

            userController.getProfile({jwt: {username: 'Valid'}}, res);

            expect(db.findUser).toHaveBeenCalledWith('Valid');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith(userData);

        });
    });
    describe('synchronizeUserCollection', () => {
        it('returns error when service throws', () => {
            games.synchronizeUserCollection.mockReturnValue([{title:'Game'}]);

            userController.synchronizeUserCollection({jwt:{username:'Dom'}}, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith([{ title: 'Game'}]);
        });
        it('returns updated collection when service returns collection', () => {

        });
    })
});