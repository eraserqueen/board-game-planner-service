const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const dbFile = path.join(__dirname, 'db.json');
const db = require('./src/db')(dbFile);
const router = jsonServer.router(dbFile);
const middlewares = jsonServer.defaults();

const scheduler = require('./src/scheduler');

server.use(middlewares);
server.use(jsonServer.bodyParser);


server.post('/auth', (req, res) => {
        const user = db.authenticate(req.body.username, req.body.password);
        if(user.error) {
            res.status(user.status).json(user);
        } else {
            res.json({
                user,
                token: 'DUMMY_JSON_WEB_TOKEN'
            });
        }
});


server.post('/register', (req, res) => {
        const user = db.register(req.body.username, req.body.password);
        if(user.error) {
            res.status(user.status).json(user);
        } else {
            res.json({
                user,
                token: 'DUMMY_JSON_WEB_TOKEN'
            });
        }
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