const _ = require('lodash');
const firebase = require('firebase');
const uuid = require('../utils/uuid').generator;

const config = {
    apiKey: "AIzaSyBFHuBxKLFK3J7iIuk-IgRMsTscUDMV4eY",
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
    if (process.env.NODE_ENV === 'prod') {
        return firebase.database().ref('/prod/' + ref);
    }
    return firebase.database().ref('/test/' + ref);
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
    addPlayer: (player) => {
        return _getRef('players/' + player.name).set(player).then(() => player);
    },
    getGames: () => {
        return _getRef('games')
            .once('value')
            .then(readJSONData)
            .then(mapResultToArray)
            .then(array => _.sortBy(array, 'title'));
    },
    setGames: (games) => {
        const mapped = mapArrayToDocuments(games);
        return _getRef('games')
            .set(mapped)
            .then(() => mapped);
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
