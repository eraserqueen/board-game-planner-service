const auth = require('../auth');
const jwt = require("jsonwebtoken");
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
    describe('getToken', () => {
        test('returns an encoded JWT', () => {
            jwt.sign.mockReturnValue('a_valid_token');
            const result = auth.getToken({name: 'Dom'});
            expect(jwt.sign).toHaveBeenCalled();
            expect(result).toEqual('a_valid_token');
        });
    });
    describe('verifyToken', () => {
        test('returns a decoded JWT', () => {
            const jwtPayload = {username: 'Dom', exp: Math.round(new Date().getTime()/1000)+9999};
            jwt.verify.mockReturnValue(jwtPayload);

            const result = auth.verifyToken('a_valid_token');

            expect(jwt.verify).toHaveBeenCalled();
            expect(result).toEqual({jwt: jwtPayload});
        });
        test('throws an error when JWT could not be verified', () => {
            jwt.verify.mockImplementation(() => {
               throw new Error('something horrible happened');
            });

            const result = auth.verifyToken('an_invalid_token');

            expect(jwt.verify).toHaveBeenCalled();
            expect(result).toEqual({error: 'something horrible happened'});
        });
        test('throws an error when JWT has expired', () => {
            const jwtPayload = {username: 'Dom', exp: Math.round(new Date().getTime()/1000)-9999};
            jwt.verify.mockReturnValue(jwtPayload);

            const result = auth.verifyToken('an_expired_token');

            expect(jwt.verify).toHaveBeenCalled();
            expect(result).toEqual({error: 'Expired JWT'});
        });
    });
});