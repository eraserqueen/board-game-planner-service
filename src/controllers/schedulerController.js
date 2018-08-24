const _ = require('lodash');
const scheduler = require("../services/scheduler");

module.exports = (req, res, next) => {
    const shouldRun = req.method === 'PUT'
        && req.path.startsWith('/events')
        && req.query['runScheduler'] === 'true'
        && !_.isEmpty(_.get(req, 'body.playerPreferences'));
    if (shouldRun) {
        req.body.schedule = scheduler.run(req.body);
    }
    // Continue to JSON Server router
    next();
};