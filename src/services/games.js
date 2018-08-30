const _ = require('lodash');
const assert = require('assert');
const bggClient = require("../clients/bggClient");
const bggAdapter = require("../utils/bggAdapter");

module.exports = (dbService) => ({
    synchronizeUserCollection: (owner) => {
        return bggClient.getCollectionAsync(owner)
            .then(bggAdapter.mapCollectionToGamesList)
            .then(userCollection => {
                const allGames = dbService.getGamesList();

                assert(userCollection instanceof Array);
                assert(allGames instanceof Array);

                // update/delete existing games
                const updatedGames = allGames
                    .map(game => {
                        const gameInUserCollection = !_.isEmpty(userCollection) && userCollection.map(g => g.title).includes(game.title);
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

                // add games that are not in gamesList
                const newGames = userCollection
                    .filter(game => !updatedGames.map(g => g.title).includes(game.title))
                    .map(game => ({...game, ownedBy: [owner]}));

                const newGamesList = _.concat(updatedGames, newGames);
                dbService.setGamesList(newGamesList);
                return newGamesList;
            })
    }
});