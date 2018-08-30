jest.mock('../../services/auth');
jest.mock('../../services/db');
jest.mock('../../services/games');

const authServiceMock = require('../../services/auth');
const dbServiceMock = require('../../services/db')();
const gamesServiceMock = require('../../services/games')();
const serviceMocks = {
    authService: authServiceMock,
    dbService: dbServiceMock,
    gamesService: gamesServiceMock,
};
const {USER_CONFLICT, USER_NOT_FOUND} = require("../../errorMessages");

describe('User Controller', () => {
    const resJsonMock = jest.fn();
    const res = {
        status: jest.fn().mockReturnValue({json: resJsonMock}).mockName('restStatusMock'),
    };

    describe('auth', () => {
        [
            {},
            {username: 'user'},
            {password: 'password'}
        ].forEach(badRequest =>
            test('returns error when incoming request is malformed', () => {
                
                const userController = require('../userController')(serviceMocks);

                userController.auth(badRequest, res);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(dbServiceMock.checkCredentials).not.toHaveBeenCalled();
            })
        );
        test('returns error when user credentials are invalid', () => {
            dbServiceMock.checkCredentials.mockImplementation(() =>{
               throw new Error('something horrible happened');
            });
            const userController = require('../userController')(serviceMocks);
            userController.auth({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(dbServiceMock.checkCredentials).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: 'something horrible happened'});
        });
        test('generates JWT when user credentials are valid', () => {
            let user = {name: 'user', avatar: 'data/image:32478odshfduewhfiw'};
            dbServiceMock.checkCredentials.mockReturnValue(user);
            authServiceMock.getToken.mockReturnValue('a_valid_token');

            const userController = require('../userController')(serviceMocks);
            userController.auth({body: {username: 'user', password: 'pass'}}, res);

            expect(dbServiceMock.checkCredentials).toHaveBeenCalledWith('user', 'pass');
            expect(authServiceMock.getToken).toHaveBeenCalledWith(user);
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
                const userController = require('../userController')(serviceMocks);
                userController.register(badRequest, res);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(dbServiceMock.addNewUser).not.toHaveBeenCalled();
                expect(authServiceMock.getToken).not.toHaveBeenCalled();
            })
        );
        test('returns error when registration failed', () => {
            dbServiceMock.addNewUser.mockImplementation(() => {
                throw new Error(USER_CONFLICT);
            });
            const userController = require('../userController')(serviceMocks);
            userController.register({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(dbServiceMock.addNewUser).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(authServiceMock.getToken).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: USER_CONFLICT});
        });
        test('generates JWT when registration was successful', () => {
            let user = {name: 'user', avatar: 'data/image:32478odshfduewhfiw'};
            dbServiceMock.addNewUser.mockReturnValue(user);
            authServiceMock.getToken.mockReturnValue('a_valid_token');

            const userController = require('../userController')(serviceMocks);
            userController.register({body: {username: 'user', password: 'pass'}}, res);

            expect(dbServiceMock.addNewUser).toHaveBeenCalledWith('user', 'pass');
            expect(authServiceMock.getToken).toHaveBeenCalledWith(user);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith({
                user,
                token: 'a_valid_token'
            });
        });

    });
    describe('getProfile', () => {
        test('returns error when user is not found', () => {
            dbServiceMock.findUser.mockImplementation(() => {
                throw new Error(USER_NOT_FOUND);
            });

            const userController = require('../userController')(serviceMocks);
            userController.getProfile({jwt: {username: 'Invalid'}}, res);

            expect(dbServiceMock.findUser).toHaveBeenCalledWith('Invalid');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: USER_NOT_FOUND});
        });
        test('returns user data', () => {
            const userData = {name: 'Valid', avatar: 'data/image;189d1duiiqeh389qh'};
            dbServiceMock.findUser.mockReturnValue(userData);

            const userController = require('../userController')(serviceMocks);
            userController.getProfile({jwt: {username: 'Valid'}}, res);

            expect(dbServiceMock.findUser).toHaveBeenCalledWith('Valid');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith(userData);

        });
    });
    describe('synchronizeUserCollection', () => {
        it('returns error when service throws', () => {
            gamesServiceMock.synchronizeUserCollection.mockReturnValue([{title:'Game'}]);

            const userController = require('../userController')(serviceMocks);
            userController.synchronizeUserCollection({jwt:{username:'Dom'}}, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith([{ title: 'Game'}]);
        });
        it('returns updated collection when service returns collection', () => {

        });
    })
});
