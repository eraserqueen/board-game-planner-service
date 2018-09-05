const _ = require('lodash');
const imageConverter = require("./imageConverter");

function convertThumbnailToDataUri(game) {
    if (!game || !game.image || game.image.startsWith('data')) {
        return game;
    }
    return imageConverter.fromUrl(game.image).then(image => Object.assign({}, game, {image}));
}

function mapAttributes(item) {
    const id = _.get(item, '_attributes.objectid');
    if (!id) {
        return;
    }
    const playingTime = _.get(item, 'stats._attributes.playingtime');
    return {
        id: parseInt(id),
        title: _.get(item, 'name._text', ''),
        image: _.get(item, 'thumbnail._text', ''),
        minPlayers: parseInt(_.get(item, 'stats._attributes.minplayers')) || null,
        maxPlayers: parseInt(_.get(item, 'stats._attributes.maxplayers')) || null,
        playingTime: playingTime ? parseInt(playingTime) : null
    };
}

function mapCollectionToGamesList(json) {
    console.log('Mapping collection to games list');
    let collection = _.get(json, 'items.item');
    if (_.isEmpty(collection)) {
        return [];
    }
    if (collection.name) {
        collection = new Array(collection);
    }
    return collection.map(mapAttributes);
}

module.exports = {
    mapCollectionToGamesList,
    convertThumbnailToDataUri
};