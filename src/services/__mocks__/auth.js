const EXPIRED_TOKEN = 'EXPIRED_TOKEN';
const VALID_TOKEN = 'VALID_TOKEN';
const DECODED_JWT = {
    "username": "Dom",
    "expires": 1534992305,
    "iat": 1534992244
};
module.exports = {
    VALID_TOKEN,
    EXPIRED_TOKEN,
    DECODED_JWT,

    getToken: () => VALID_TOKEN,
    verifyToken: (token) => {
        if (token === VALID_TOKEN) {
            return ({
                jwt: DECODED_JWT
            });
        }
        if (token === EXPIRED_TOKEN) {
            return {error: 'Expired token'}
        }
    }
};