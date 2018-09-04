jest.mock('../../services/authService');
jest.mock('../../services/userService');
jest.mock('../../services/gamesService');

const authServiceMock = require('../../services/authService');
const userServiceMock = require('../../services/userService')();
const gamesServiceMock = require('../../services/gamesService')();
const serviceMocks = {
    authService: authServiceMock,
    userService: userServiceMock,
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
            test('returns error when incoming request is malformed', async () => {

                const userController = require('../userController')(serviceMocks);

                await userController.auth(badRequest, res);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(userServiceMock.checkCredentials).not.toHaveBeenCalled();
            })
        );
        test('returns error when user credentials are invalid', async () => {
            userServiceMock.checkCredentials.mockRejectedValue(new Error('something horrible happened'));
            const userController = require('../userController')(serviceMocks);

            await userController.auth({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(userServiceMock.checkCredentials).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: 'something horrible happened'});
        });
        test('generates JWT when user credentials are valid', async () => {
            let user = {name: 'user', avatar: 'data/image:32478odshfduewhfiw'};
            userServiceMock.checkCredentials.mockResolvedValue(user);
            authServiceMock.getToken.mockReturnValue('a_valid_token');

            const userController = require('../userController')(serviceMocks);
            await userController.auth({body: {username: 'user', password: 'pass'}}, res);

            expect(userServiceMock.checkCredentials).toHaveBeenCalledWith('user', 'pass');
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
            test('returns error when incoming request is malformed', async () => {
                const userController = require('../userController')(serviceMocks);
                await userController.register(badRequest, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(userServiceMock.addNewUser).not.toHaveBeenCalled();
                expect(authServiceMock.getToken).not.toHaveBeenCalled();
            })
        );
        test('returns error when registration failed', async () => {
            userServiceMock.addNewUser.mockRejectedValue(new Error(USER_CONFLICT));
            const userController = require('../userController')(serviceMocks);
            await userController.register({body: {username: 'invalidUser', password: 'pass'}}, res);

            expect(userServiceMock.addNewUser).toHaveBeenCalledWith('invalidUser', 'pass');
            expect(authServiceMock.getToken).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: USER_CONFLICT});
        });
        test('generates JWT when registration was successful', async () => {
            let user = {name: 'user', avatar: 'data/image:32478odshfduewhfiw'};
            userServiceMock.addNewUser.mockResolvedValue(user);
            authServiceMock.getToken.mockReturnValue('a_valid_token');

            const userController = require('../userController')(serviceMocks);
            await userController.register({body: {username: 'user', password: 'pass'}}, res);

            expect(userServiceMock.addNewUser).toHaveBeenCalledWith('user', 'pass');
            expect(authServiceMock.getToken).toHaveBeenCalledWith(user);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith({
                user,
                token: 'a_valid_token'
            });
        });

    });
    describe('getProfile', () => {
        test('returns error when user is not found', async () => {
            userServiceMock.findUser.mockRejectedValue(new Error(USER_NOT_FOUND));

            const userController = require('../userController')(serviceMocks);
            await userController.getProfile({jwt: {username: 'Invalid'}}, res);

            expect(userServiceMock.findUser).toHaveBeenCalledWith('Invalid');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resJsonMock).toHaveBeenCalledWith({error: USER_NOT_FOUND});
        });
        test('returns user data', async () => {
            const userData = {name: 'Valid', avatar: 'data/image;189d1duiiqeh389qh'};
            userServiceMock.findUser.mockResolvedValue(userData);

            const userController = require('../userController')(serviceMocks);
            await userController.getProfile({jwt: {username: 'Valid'}}, res);

            expect(userServiceMock.findUser).toHaveBeenCalledWith('Valid');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith(userData);

        });
    });
    describe('synchronizeUserCollection', () => {
        it('returns error when service throws', () => {
            gamesServiceMock.synchronizeUserCollection.mockReturnValue([{title: 'Game'}]);

            const userController = require('../userController')(serviceMocks);
            userController.synchronizeUserCollection({jwt: {username: 'Dom'}}, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(resJsonMock).toHaveBeenCalledWith([{title: 'Game'}]);
        });
        it('returns updated collection when service returns collection', () => {

        });
    })
});
