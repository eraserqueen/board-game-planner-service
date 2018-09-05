const _ = require('lodash');
const firebase = require('firebase');
const uuid = require('../utils/uuid').generator;
const {FIREBASE_API_KEY, NODE_ENV} = process.env;

const config = {
    apiKey: FIREBASE_API_KEY,
    authDomain: "board-games-planner.firebaseapp.com",
    databaseURL: "https://board-games-planner.firebaseio.com",
    projectId: "board-games-planner",
    storageBucket: "board-games-planner.appspot.com",
    messagingSenderId: "741707614163"
};
firebase.initializeApp(config);

const readJSONData = result => result.toJSON();
const mapResultToArray = result => {
    return _.map(result, (props, id) => {
        return ({id, ...props});
    });
};
const mapArrayToDocuments = array => _.reduce(array, (result, item) => {
    result[item.id] = _.omit(item, 'id');
    return result;
}, {});

const _getRef = (ref) => {
    return firebase.database().ref('/'+NODE_ENV+'/' + ref);
};


module.exports = {
    _clearTestData: () => {
        return firebase.database().ref('/test').set(null);
    },
    _closeConnection: () => {
        firebase.database().goOffline();
        firebase.delete();
    },
    getPlayer: (name) => {
        return _getRef('players/' + name)
            .once('value')
            .then(readJSONData);

    },
    getPlayers: () => {
        return _getRef('/players')
            .once('value')
            .then(readJSONData)
            .then(mapResultToArray)
            .then(array => _.sortBy(array, 'name'));
    },
    addPlayer: (player) => {
        return _getRef('players/' + player.name).set(player).then(() => player);
    },
    getGames: () => {
        return _getRef('games')
            .once('value')
            .then(readJSONData)
            .then(mapResultToArray)
            .then(array => array.map(game => ({...game, ownedBy: Object.values(game.ownedBy || {})})))
            .then(array => _.sortBy(array, 'title'));
    },
    setGames: (games) => {
        const mapped = mapArrayToDocuments(games);
        return _getRef('games')
            .set(mapped)
            .then(() => games);
    },
    addEvent: (event) => {
        let eventId = uuid();
        return _getRef('events/' + eventId)
            .set(event)
            .then(() => eventId);
    },
    getEvent: (eventId) => {
        return _getRef('events/' + eventId)
            .once('value')
            .then(readJSONData)
            .then(event => ({...event, id: eventId}));
    },
    getEvents: () => {
        return _getRef('events')
            .orderByChild('dateTimeStart')
            .once('value')
            .then(readJSONData)
            .then(mapResultToArray);
    },
};
