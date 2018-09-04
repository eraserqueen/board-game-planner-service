const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {USER_NOT_FOUND, USER_CONFLICT, INVALID_CREDENTIALS} = require("../errorMessages");

module.exports = (dbClient) => {
    const sanitizedPlayer = (player) => _.omit(player, ['hash', 'salt']);
    return ({
        checkCredentials: (name, password) => {
            return dbClient
                .getPlayer(name)
                .then(player => {
                    if (!player) {
                        throw new Error(INVALID_CREDENTIALS);
                    }
                    return player;
                })
                .then(player => {
                    if (bcrypt.hashSync(password, player.salt) !== player.hash) {
                        throw new Error(INVALID_CREDENTIALS)
                    }
                    return player;
                })
                .then(sanitizedPlayer);
        },
        findUser: (name) => {
            return dbClient
                .getPlayer(name)
                .then(player => {
                    if (!player) {
                        throw new Error(USER_NOT_FOUND);
                    }
                    return player;
                })
                .then(sanitizedPlayer);

        },
        addNewUser: (name, password) => {
            return dbClient
                .getPlayer(name)
                .then(existing => {
                    if (existing) {
                        throw new Error(USER_CONFLICT);
                    }
                })
                .then(() => {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);
                    return {name, hash, salt};
                })
                .then(newUser => dbClient.addPlayer(newUser))
                .then(sanitizedPlayer)
                .then(createdUser => ({avatar: '', ...createdUser})); // TODO md5 hash for gravatar

        },
    });
};
