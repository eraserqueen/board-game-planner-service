const {VALID_TOKEN, EXPIRED_TOKEN, DECODED_JWT} = require("../../services/__mocks__/auth");

const authController = require('../authController');
jest.mock('../../services/auth');

describe('Auth Controller', () => {
    const next = jest.fn();
    const resJsonMock = jest.fn();
    const res = {
        status: jest.fn().mockReturnValue({json: resJsonMock}),
    };

    test('allows anonymous /auth call', () => {
        authController({method: 'POST', path: '/auth'}, res, next);
        expect(next).toBeCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
    test('allows anonymous /register call', () => {
        authController({method: 'POST', path: '/register'}, res, next);
        expect(next).toBeCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
    test('allows calls with a valid JWT', () => {
        let req = {
            method: 'GET',
            path: '/events',
            headers: {
                authorization: 'Bearer ' + VALID_TOKEN
            }
        };
        authController(req, res, next);
        expect(req.jwt).toEqual(DECODED_JWT);
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
        let req = {
            method: 'GET',
            path: '/events',
            headers: {
                authorization: 'Bearer ' + EXPIRED_TOKEN
            }
        };
        authController(req, res, next);
        expect(next).not.toBeCalled();
        expect(req.jwt).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(resJsonMock).toHaveBeenCalledWith({error: 'Expired token'});
    });
});