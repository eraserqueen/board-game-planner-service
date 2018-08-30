const jwt = require("jsonwebtoken");

const JWT_CRYPTO_KEY = 'super_secret_key';

module.exports = {
    getToken: (user) => {
        return jwt.sign({username: user.name}, JWT_CRYPTO_KEY, {expiresIn: '1h'});
    },
    verifyToken: (token) => {
        try {
            const payload = jwt.verify(token, JWT_CRYPTO_KEY);
            if (payload.exp < new Date().getTime() / 1000) {
                return {error: 'Expired JWT'};
            }
            return {jwt: payload};

        } catch (error) {
            return {error: error.message};
        }
    }
};