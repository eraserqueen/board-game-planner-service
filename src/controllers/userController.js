const _ = require('lodash');
const db = require('../services/db');
const auth = require("../services/auth");
const {USERNAME_OR_PASSWORD_MISSING} = require("../errorMessages");

module.exports = {
    auth: (req, res) => {
        if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
            res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
        } else {
            try {
                const user = db.findUser(req.body.username, req.body.password);
                res.status(200).json({
                    user,
                    token: auth.getToken(user)
                });
            } catch (error) {
                res.status(500).json({error: error.message});
            }
        }
    },

    register: (req, res) => {
        if (_.isEmpty(_.get(req, 'body.username')) || _.isEmpty(_.get(req, 'body.password'))) {
            res.status(400).json({error: USERNAME_OR_PASSWORD_MISSING});
        } else {
            try {
                const user = db.addNewUser(req.body.username, req.body.password);
                res.status(200).json({
                    user,
                    token: auth.getToken(user)
                })
            } catch (error) {
                res.status(500).json({error: error.message});
            }
        }
    }

};