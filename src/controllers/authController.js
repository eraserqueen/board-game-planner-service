module.exports = (req, res, next) => {
    if (req.headers['authorization'] === 'Bearer DUMMY_JSON_WEB_TOKEN') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized'});
    }
};