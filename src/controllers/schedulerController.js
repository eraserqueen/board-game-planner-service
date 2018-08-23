const scheduler = require("../services/scheduler");

module.exports = (req, res, next) => {
    if (req.method === 'PUT'
        && req.path.startsWith('/events')
        && req.query['runScheduler'] === 'true') {
        req.body.schedule = scheduler.run(req.body);
    }
    // Continue to JSON Server router
    next();
};