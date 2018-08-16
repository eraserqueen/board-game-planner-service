const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');

module.exports = (dbFile) => {

    const adapter = new FileSync(dbFile);
    const db = low(adapter);
    return ({
        init: () => {
            db.defaults({games: [], players: [], events: []}).write();
        },
        clear: () => {
            db.set('games', [])
                .set('players', [])
                .set('events', [])
                .write();
        },
        authenticate: (name, password) => {
            const player = db.get('players').find({name}).value();
            if (player && bcrypt.hashSync(password, player.salt) === player.hash) {
                return ({name: player.name, avatar: player.avatar || ''});
            }
            return ({status: 404, error: 'invalid username or password'});
        },
        register: (name, password) => {
            const existing = db.get('players').find({name}).value();
            if (existing) {
                return ({status: 409, error: 'username already exists'});
            }
            if (!password) {
                return ({status: 400, error: 'password cannot be empty'});
            }
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            db.get('players').push({name, hash, salt}).write();

            return ({name, avatar: ''}); // TODO md5 hash for gravatar

        },
    });
};