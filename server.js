const _ = require('lodash');
const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const dbFile = path.join(__dirname, process.env.npm_package_config_db);
const router = jsonServer.router(dbFile);
const middlewares = jsonServer.defaults();

const db = require('./src/db')(dbFile);
const user = require('./src/user')(db);
const scheduler = require('./src/scheduler');
const {USERNAME_OR_PASSWORD_MISSING} = require("./src/errorMessages");

server.use(middlewares);
server.use(jsonServer.bodyParser);


server.post('/auth', (req, res) => {
    if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
        res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
    }
    const result = user.authenticate(req.body.username, req.body.password);
    res.status(result.error ? 500 : 200).json(result);
});


server.post('/register', (req, res) => {
    if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
        res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
    }
    const result = user.register(req.body.username, req.body.password);
    res.status(result.error ? 500 : 200).json(result);
});

server.use((req, res, next) => {
    if (req.headers['authorization'] === 'Bearer DUMMY_JSON_WEB_TOKEN') {
        next();
    } else {
        res.sendStatus(401);
    }
});

server.use((req, res, next) => {
    if (req.method === 'PUT'
        && req.path.startsWith('/events')
        && req.query['runScheduler'] === 'true') {
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