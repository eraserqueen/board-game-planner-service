module.exports = (dbClient) =>
    async (req, res, next) => {

        const routes = {
            "/events": dbClient.getEvents,
            "/games": dbClient.getGames,
            "/players": dbClient.getPlayers
        };

        const serviceCall = routes[req.path];
        if (req.method !== 'GET' || !serviceCall) {
            next();
            return;
        }

        const [status, body] = await serviceCall()
            .then(results => [200, results])
            .catch(error => [500, {error}]);

        console.log(`[${req.method}] ${req.path} - ${status}`);
        res.status(status).json(body);
    };