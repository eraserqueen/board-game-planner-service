const auth = require('../../services/auth');
const authController = require('../authController');
jest.mock('../../services/auth');

describe('Auth Controller', () => {
    const next = jest.fn();
    const resJsonMock = jest.fn();
    const res = {
        status: jest.fn().mockReturnValue({json: resJsonMock}),
    };

    test('does not verify JWT on /auth call', () => {
        authController({method: 'POST', path: '/auth'}, res, next);
        expect(next).toBeCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
    test('does not verify JWT on /register call', () => {
        authController({method: 'POST', path: '/register'}, res, next);
        expect(next).toBeCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
    test('verifies JWT on all other calls', () => {
        auth.verifyToken.mockImplementation(() => ({
            jwt: {
                username: 'user',
                expires: 123456789
            }
        }));
        let req = {
            method: 'GET',
            path: '/events',
            headers: {
                authorization: 'Bearer this_is_a_valid_token'
            }
        };
        authController(req, res, next);
        expect(req.jwt).toEqual({username: 'user', expires: 123456789});
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();

    });
    test('returns 401 response when login is required and authorization header is missing', () => {
        let req = {
            method: 'GET',
            path: '/events',
        };
        authController(req, res, next);
        expect(next).not.toBeCalled();
        expect(req.jwt).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(resJsonMock).toHaveBeenCalledWith({error: 'Unauthorized access'});
    });
    test('returns 401 response when login is required and JWT is invalid', () => {
        auth.verifyToken.mockImplementation(() => ({
            error: 'Expired token'
        }));
        let req = {
            method: 'GET',
            path: '/events',
            headers: {
                authorization: 'Bearer expired_token'
            }
        };
        authController(req, res, next);
        expect(next).not.toBeCalled();
        expect(req.jwt).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(resJsonMock).toHaveBeenCalledWith({error: 'Expired token'});
    });
});