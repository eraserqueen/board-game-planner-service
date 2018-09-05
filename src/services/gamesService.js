const _ = require('lodash');
const bggClient = require("../clients/bggClient");
const bggAdapter = require("../utils/bggAdapter");

module.exports = (dbClient) => ({
    synchronizeUserCollection: (owner) => {
        const getOnlineList = bggClient.getCollectionAsync(owner);
        const getDbList = dbClient.getGames();

        return Promise.all([getOnlineList, getDbList])
            .then(([onlineList, dbList]) => {
                console.log('update/delete existing games');
                const userCollection = bggAdapter.mapCollectionToGamesList(onlineList);
                const updatedGames = dbList
                    .map(game => {
                        const gameInUserCollection = !_.isEmpty(userCollection) && userCollection.map(g => g.id).includes(game.id);
                        // user no longer owns the game
                        if (game.ownedBy.includes(owner) && !gameInUserCollection) {
                            const newOwners = _.pull(game.ownedBy, owner);
                            // no one owns that game
                            if (_.isEmpty(newOwners)) {
                                return null;
                            }
                            return _.assign({}, game, {ownedBy: newOwners});
                        }
                        // user now owns the game
                        if (!game.ownedBy.includes(owner) && gameInUserCollection) {
                            return _.assign({}, game, {ownedBy: _.concat(game.ownedBy, owner)});
                        }
                        return game;
                    })
                    .filter(_.identity);

                console.log('add games that are not in gamesList');
                const newGames = userCollection
                    .filter(game => !updatedGames.map(g => g.id).includes(game.id))
                    .map(game => ({...game, ownedBy: [owner]}));

                return _.concat(updatedGames, newGames);
            })
            .then(newGamesList => Promise.all(newGamesList.map(game => bggAdapter.convertThumbnailToDataUri(game))))
            .then(newGamesList => dbClient.setGames(newGamesList));
    }
});