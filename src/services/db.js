const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {USER_NOT_FOUND, USER_CONFLICT, INVALID_CREDENTIALS} = require("../errorMessages");

module.exports = (dbClient) => {
    const sanitizedPlayer = (player) => _.omit(player, ['hash', 'salt']);
    return ({
        checkCredentials: (name, password) => {
            const player = dbClient.getPlayer(name);
            if (player && bcrypt.hashSync(password, player.salt) === player.hash) {
                return sanitizedPlayer(player);
            } else {
                throw new Error(INVALID_CREDENTIALS)
            }
        },
        findUser: (name) => {
            const player = dbClient.getPlayer(name);
            if (player) {
                return sanitizedPlayer(player);
            } else {
                throw new Error(USER_NOT_FOUND)
            }
        },
        addNewUser: (name, password) => {
            const existing = dbClient.getPlayer(name);
            if (existing) {
                throw new Error(USER_CONFLICT);
            }

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            dbClient.addPlayer({name, hash, salt});

            return ({name, avatar: ''}); // TODO md5 hash for gravatar
        },
        getGamesList: () => dbClient.getGames(),
        setGamesList: (games) => dbClient.setGames(games)
    });
};
