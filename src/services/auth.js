const jwt = require("jsonwebtoken");

const JWT_CRYPTO_KEY = 'super_secret_key';
const JWT_EXPIRY_SECONDS = 60;

module.exports = {
    getToken: (user) => {
        return jwt.sign({
            username: user.name,
            expires: Math.round(new Date().getTime()/1000) + JWT_EXPIRY_SECONDS
        }, JWT_CRYPTO_KEY);
    },
    verifyToken: (token) => {
        return jwt.verify(token, JWT_CRYPTO_KEY, (error, jwt) => {
            if (error) {
                return {error: error.message};
            }
            if (jwt.expires < new Date().getTime()/1000) {
                return {error: 'Expired JWT token'};
            }
            return {jwt};
        });
    }
};