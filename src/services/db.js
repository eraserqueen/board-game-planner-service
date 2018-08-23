const lowDB = require('lowdb');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');
const {USER_NOT_FOUND, USER_CONFLICT} = require("../errorMessages");

function getDbFilePath() {
    let dbFile;
    if (process.env.NODE_ENV === 'test') {
        dbFile = './data/__tests__/db.json';
    } else {
        dbFile = './data/db.json';
    }
    return path.join(__dirname, '../../', dbFile);
}

const db = lowDB(new FileSync(getDbFilePath()));
module.exports = {
    getDbFilePath,
    init: () => {
        db.defaults({games: [], players: [], events: []}).write();
    },
    clear: () => {
        db.set('games', [])
            .set('players', [])
            .set('events', [])
            .write();
    },
    findUser: (name, password) => {
        const player = db.get('players').find({name}).value();
        if (player && bcrypt.hashSync(password, player.salt) === player.hash) {
            return ({name: player.name, avatar: player.avatar || ''});
        } else {
            throw new Error(USER_NOT_FOUND)
        }
    },
    addNewUser: (name, password) => {
        const existing = db.get('players').find({name}).value();
        if (existing) {
            throw new Error(USER_CONFLICT);
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        db.get('players').push({name, hash, salt}).write();

        return ({name, avatar: ''}); // TODO md5 hash for gravatar

    },
};