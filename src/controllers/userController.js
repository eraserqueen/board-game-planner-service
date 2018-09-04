const _ = require('lodash');
const {USERNAME_OR_PASSWORD_MISSING} = require("../errorMessages");

module.exports = ({authService, userService, gamesService}) => ({
    auth: async (req, res) => {
        if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
            res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
        } else {
            try {
                const user = await userService.checkCredentials(req.body.username, req.body.password);
                res.status(200).json({
                    user,
                    token: authService.getToken(user)
                });
            } catch (error) {
                res.status(500).json({error: error.message});
            }
        }
    },

    register: async (req, res) => {
        if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
            res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
        } else {
            try {
                const user = await userService.addNewUser(req.body.username, req.body.password);
                res.status(200).json({
                    user,
                    token: authService.getToken(user)
                })
            } catch (error) {
                res.status(500).json({error: error.message});
            }
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await userService.findUser(_.get(req, 'jwt.username'));
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    synchronizeUserCollection: (req, res) => {
        try {
            const updatedCollection = gamesService.synchronizeUserCollection(_.get(req, 'jwt.username'));
            res.status(200).json(updatedCollection);
        } catch (error) {
            res.status(500).json({error: error.message});

        }
    }
});