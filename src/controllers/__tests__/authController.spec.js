jest.mock('../../services/authService');
const auth = require('../../services/authService');
const authController = require('../authController');

describe('Auth Controller', () => {
    const validHeaders = {authorization: 'Bearer this_is_a_valid_token'};
    const next = jest.fn();
    const resJsonMock = jest.fn();
    const res = {
        status: jest.fn().mockReturnValue({json: resJsonMock}),
    };
    [
        {method: 'POST', path: '/auth'},
        {method: 'POST', path: '/register'}
    ].forEach(unAuthReq =>
        test('does not verify JWT on public endpoints', () => {
            authController(unAuthReq, res, next);
            expect(next).toBeCalled();
            expect(res.status).not.toHaveBeenCalled();
        }));
    [
        {method: 'GET', path: '/events', headers: validHeaders},
        {method: 'GET', path: '/games', headers: validHeaders},
        {method: 'GET', path: '/players', headers: validHeaders},
    ].forEach(req =>
        test('allows authenticated requests to private endpoints', () => {
            auth.verifyToken = jest.fn().mockReturnValue({
                jwt: {
                    username: 'user',
                    expires: 123456789
                }
            });
            authController(req, res, next);
            expect(req.jwt).toEqual({username: 'user', expires: 123456789});
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();

        })
    );
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
        auth.verifyToken = jest.fn().mockReturnValue({error: 'Expired token'});
        let req = {
            method: 'GET',
            path: '/events',
            headers: {
                authorization: 'Bearer expired_token'
            },
            jwt: { username: 'I exist'}
        };
        authController(req, res, next);
        expect(next).not.toBeCalled();
        expect(req.jwt).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(resJsonMock).toHaveBeenCalledWith({error: 'Expired token'});
    });
});