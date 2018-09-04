const path = require('path');
const FileAsync = require('lowdb/adapters/FileAsync');

function _getDbFilePath() {
    let dbFile;
    if (process.env.NODE_ENV === 'test') {
        dbFile = './data/db.test.json';
    } else {
        dbFile = './data/db.json';
    }
    return path.join(__dirname, '../../', dbFile);
}

const lowDB = require('lowdb')(new FileAsync(_getDbFilePath()));

module.exports = {
    _getDbFilePath,

    getPlayer: (name) => {
        return lowDB.then(db => db.get('players').find({name}).value());
    },
    addPlayer: ({name, hash, salt}) => {
        return lowDB
            .then(db => db.get('players').push({name, hash, salt}).write())
            .then(() => this.getPlayer(name));
    },
    getGames: () => lowDB.then(db => db.get('games').value()),
    setGames: (games) => lowDB.then(db => db.set('games', games)),
    addEvent: (event) => lowDB.then(db => db.get('events').push(event).write()),
    getEvent: (id) => lowDB.then(db => db.get('events').find({id}).value()),
    getEvents: () => lowDB.then(db => db.get('events').value()),
};