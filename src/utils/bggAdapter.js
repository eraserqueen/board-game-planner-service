const _ = require('lodash');
const imageConverter = require("./imageConverter");

async function convertThumbnailToDataUri(game) {
    if (_.isEmpty(game.image) || game.image.startsWith('data')) {
        return game;
    }
    return await imageConverter.fromUrl(game.image).then(image => Object.assign({}, game, {image}));
}

function mapAttributes(item) {
    return {
        title: item.name._text,
        image: item.thumbnail._text,
        minPlayers: parseInt(item.stats._attributes.minplayers),
        maxPlayers: parseInt(item.stats._attributes.maxplayers),
        playingTime: parseInt(item.stats._attributes.playingtime),
    };
}

function mapCollectionToGamesList(json) {
    let collection = _.get(json, 'items.item');
    if (_.isEmpty(collection)) {
        return [];
    }
    if (collection.name) {
        collection = new Array(collection);
    }
    return Promise.all(collection
        .map(mapAttributes)
        .map(convertThumbnailToDataUri)
    );
}

module.exports = {
    mapCollectionToGamesList,
    convertThumbnailToDataUri
};