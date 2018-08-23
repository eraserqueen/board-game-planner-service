const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const dbFile = path.join(__dirname, process.env.npm_package_config_db);

const authController = require('./src/controllers/authController');
const schedulerController = require('./src/controllers/schedulerController');
const userController = require('./src/controllers/userController');

// middlewares
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);
server.use(authController);
server.use(schedulerController);

// specific routes
server.post('/auth', userController.auth);
server.post('/register', userController.register);

// JSON-server default router
server.use(jsonServer.router(dbFile));
server.listen(3000, () => {
    console.log('JSON Server is running')
});