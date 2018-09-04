const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');

function _getDbFilePath() {
    let dbFile;
    if (process.env.NODE_ENV === 'test') {
        dbFile = './data/db.test.json';
    } else {
        dbFile = './data/db.json';
    }
    return path.join(__dirname, '../../', dbFile);
}

const lowDB = require('lowdb')(new FileSync(_getDbFilePath()));

lowDB.defaults({games: [], players: [], events: []}).write();

module.exports = {
    _getDbFilePath,

    getPlayer: (name) => lowDB.get('players').find({name}).value(),
    addPlayer: ({name, hash, salt}) => lowDB.get('players').push({name, hash, salt}).write(),
    getGames: () => lowDB.get('games').value(),
    setGames: (games) => lowDB.set('games', games),
    addEvent: (event) => lowDB.get('events').push(event).write(),
    getEvent: (id) => lowDB.get('events').find({id}).value(),
    getEvents: () => lowDB.get('events').value(),
};