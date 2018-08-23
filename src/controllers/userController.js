const _ = require('lodash');
const path = require('path');
const dbFile = path.join(__dirname, '../../', process.env.npm_package_config_db);
const db = require('../services/db')(dbFile);
const auth = require('../services/auth');
const {USERNAME_OR_PASSWORD_MISSING} = require("../errorMessages");

module.exports = {
    auth: (req, res) => {
        if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
            res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
        }
        db.findUser(req.body.username, req.body.password)
            .then(user => res.status(200).json({
                user,
                token: auth.getToken(user.name)
            }))
            .catch(error => res.status(500).json({error}))

    },

    register: (req, res) => {
        if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
            res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
        }
        db.addNewUser(req.body.username, req.body.password)
            .then(user => res.status(200).json({
                user,
                token: auth.getToken(user.name)
            }))
            .catch(error => res.status(500).json({error}));
    }

};