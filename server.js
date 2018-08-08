const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults();

const scheduler = require('./src/scheduler');

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
    if (req.method === 'PUT'
        && req.path.startsWith('/events')
        && req.query.runScheduler) {
            req.body.schedule = scheduler.run(req.body);
    }
    // Continue to JSON Server router
    next();
});

// Use default router
server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running')
});