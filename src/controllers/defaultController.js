module.exports = (dbClient) =>
    async (req, res, next) => {

        const routes = {
            "GET": {
                "/events": [dbClient.getEvents],
                "/games": [dbClient.getGames],
                "/players": [dbClient.getPlayers]
            },
            "POST": {
                "/events": [dbClient.addEvent, req.body],
            }
        };

        let status, body;
        if (!routes[req.method]) {
            status = 405;
            body = {error: `Invalid method ${req.method}`};
        }
        else if (!routes[req.method][req.path]) {
            status = 404;
            body = {error: `Invalid path ${req.path}`};
        }
        else {
            const [serviceCall, args] = routes[req.method][req.path];
            const [status, body] = await (args ? serviceCall(args) : serviceCall())
                .then(results => [200, results])
                .catch(error => [500, {error}]);
        }
        console.log(`[${req.method}] ${req.path} ${req.params} - ${status}`);
        res.status(status).json(body);
    };