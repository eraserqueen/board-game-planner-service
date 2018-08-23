const _ = require('lodash');
const xml2js = require("xml2js");
const imageConverter = require("./imageConverter");

async function convertThumbnailToDataUri(game) {
    if(_.isEmpty(game.image) || game.image.startsWith('data')) {
        return game;
    }
    return await imageConverter.fromUrl(game.image).then(image => Object.assign({}, game, {image}));
}

function mapCollectionToGamesList(xml) {
    const parser = new xml2js.Parser();
    let gamesList = [];
    parser.parseString(xml, (err, parsed) => {
        if (!err && !_.isEmpty(_.get(parsed, 'items.item'))) {
            gamesList = parsed.items.item.map(item =>
                ({
                    title: item.name[0]._,
                    image: item.thumbnail[0],
                    minPlayers: parseInt(item.stats[0].$.minplayers),
                    maxPlayers: parseInt(item.stats[0].$.maxplayers),
                    playingTime: parseInt(item.stats[0].$.playingtime),
                }));
        }
    });
    if(_.isEmpty(gamesList)) {
        return gamesList;
    }
    return Promise.all(gamesList.map(convertThumbnailToDataUri));
}

module.exports = {
    mapCollectionToGamesList,
    convertThumbnailToDataUri
};