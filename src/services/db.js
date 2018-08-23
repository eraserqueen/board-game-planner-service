const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');
const {USER_NOT_FOUND, USER_CONFLICT} = require("../errorMessages");

module.exports = (dbFile) => {
    this.db = low(new FileSync(dbFile));

    return ({
        init: () => {
            this.db.defaults({games: [], players: [], events: []}).write();
        },
        clear: () => {
            this.db.set('games', [])
                .set('players', [])
                .set('events', [])
                .write();
        },
        findUser: (name, password) => {
            return new Promise((resolve, reject) => {
                const player = this.db.get('players').find({name}).value();
                if (player && bcrypt.hashSync(password, player.salt) === player.hash) {
                    resolve({name: player.name, avatar: player.avatar || ''});
                } else {
                    reject(USER_NOT_FOUND)
                }
            });
        },
        addNewUser: (name, password) => {
            return new Promise((resolve, reject) => {
                const existing = this.db.get('players').find({name}).value();
                if (existing) {
                    reject(USER_CONFLICT);
                } else {

                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);

                    this.db.get('players').push({name, hash, salt}).write();

                    resolve({name, avatar: ''}); // TODO md5 hash for gravatar
                }
            });
        },
    });
};