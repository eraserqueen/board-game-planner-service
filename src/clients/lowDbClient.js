const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');

function getDbFilePath() {
    let dbFile;
    if (process.env.NODE_ENV === 'test') {
        dbFile = './data/db.test.json';
    } else {
        dbFile = './data/db.json';
    }
    return path.join(__dirname, '../../', dbFile);
}

const lowDB = require('lowdb')(new FileSync(getDbFilePath()));

lowDB.defaults({games: [], players: [], events: []}).write();

module.exports = {
    getDbFilePath,
    getPlayer: (name) => lowDB.get('players').find({name}).value(),
    addPlayer: ({name, hash, salt}) => lowDB.get('players').push({name, hash, salt}).write(),
    getGames: () => lowDB.get('games').value(),
    setGames: (games) => lowDB.set('games', games)
};