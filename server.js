const jsonServer = require('json-server');
const server = jsonServer.create();

const dbClient = require('./src/clients/lowDbClient');
const
    dbService = require('./src/services/userService')(dbClient),
    authService = require('./src/services/authService'),
    gamesService = require('./src/services/gamesService')(dbClient);

const
    authController = require('./src/controllers/authController'),
    schedulerController = require('./src/controllers/schedulerController'),
    userController = require('./src/controllers/userController')({
        authService,
        dbService,
        gamesService
    });


// middlewares
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);
server.use(authController);
server.use(schedulerController);

// specific routes
server.post('/auth', userController.auth);
server.post('/register', userController.register);
server.get('/me/profile', userController.getProfile);

// JSON-server default router
server.use(jsonServer.router(dbClient.getDbFilePath()));
server.listen(3000, () => {
    console.log('JSON Server is running')
});