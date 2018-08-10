const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults();

const scheduler = require('./src/scheduler');

server.use(middlewares);
server.use(jsonServer.bodyParser)


server.post('/auth', (req, res) => {
    if (req.method === 'POST'
        && req.path === '/auth') {
        res.json({
            user: {
                "name": "Dom",
                "avatar": "https://www.gravatar.com/avatar/84ef5fffabcdb8a829bbdc54deaa3d79?r=pg&d=identicon"
            },
            token: 'DUMMY_JSON_WEB_TOKEN'
        })
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