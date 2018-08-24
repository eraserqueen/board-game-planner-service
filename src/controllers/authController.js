const auth = require("../services/auth");
const UNAUTHORIZED_ACCESS = require("../errorMessages").UNAUTHORIZED_ACCESS;


function loginRequired(req) {
    return !(req.method === 'POST' && ['/auth', '/register'].includes(req.path))
}

module.exports = (req, res, next) => {
    if (!loginRequired(req)) {
        next();
    }
    else if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const {error, jwt} = auth.verifyToken(req.headers.authorization.split(' ')[1]);
        if (error) {
            req.jwt = undefined;
            res.status(401).json({error});
        } else {
            req.jwt = jwt;
            next();
        }
    } else {
        req.jwt = undefined;
        res.status(401).json({error: UNAUTHORIZED_ACCESS});
    }
};