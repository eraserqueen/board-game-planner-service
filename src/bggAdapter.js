const xml2js = require("xml2js");


module.exports = {
    mapCollectionToGamesList: (xml) => {
        let gamesList = [];
        const parser = new xml2js.Parser();
        parser.parseString(xml, (err, parsed) => {
            if (!err && parsed.items && parsed.items.item) {
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
        return gamesList;
    }
};