let server, dbClient, defaultController;

if (process.env.npm_package_config_dbEngine === 'json-server') {

    console.log('Using json-server with local json file');

    let jsonServer = require('json-server');
    server = jsonServer.create();
    server.use(jsonServer.defaults());
    server.use(jsonServer.bodyParser);

    dbClient = require('./src/clients/lowDbClient');
    defaultController = jsonServer.router(dbClient._getDbFilePath());

} else if (process.env.npm_package_config_dbEngine === 'firebase') {
    console.log('Using express server with firebase db in environment "'+ process.env.NODE_ENV + '"');

    server = require('express')();
    server.use(require('body-parser').json());

    dbClient = require('./src/clients/firebaseDbClient');
    defaultController = require('./src/controllers/defaultController')(dbClient);
} else {
    return 'Invalid dbEngine specified in config';
}

const
    authService = require('./src/services/authService'),
    userService = require('./src/services/userService')(dbClient),
    gamesService = require('./src/services/gamesService')(dbClient);

const
    authController = require('./src/controllers/authController'),
    schedulerController = require('./src/controllers/schedulerController'),
    userController = require('./src/controllers/userController')({
        authService,
        userService,
        gamesService
    });

// middlewares
server.use(authController);
server.use(schedulerController);

// specific routes
server.post('/auth', userController.auth);
server.post('/register', userController.register);
server.get('/me/profile', userController.getProfile);
server.put('/me/collection/sync', userController.synchronizeUserCollection);

server.use(defaultController);

server.listen(3000, () => {
    console.log('Server is running')
});