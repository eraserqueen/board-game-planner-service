const _ = require('lodash');

module.exports = {
    run: (event) => {
        if (_.isEmpty(event.playerPreferences)) {
            return [];
        }
        if (_.uniq(event.playerPreferences.map(p => p.playerName)).length === 1) {
            return event.playerPreferences.map(p => _.omit(p, ['playerName']));
        }
        const weighted = event.playerPreferences
            .map(p => ({gameId: p.gameId, points: 4 - p.order}));
        const grouped = _.values(_.groupBy(weighted, 'gameId'));
        const mapped = _.map(grouped, prefs => ({
            gameId: prefs[0].gameId,
            points: _.sumBy(prefs, p => p.points)
        }));
        const schedule = _.orderBy(mapped, 'points', 'desc')
            .slice(0, 3)
            .map(({gameId}, index) => ({
                gameId,
                order: index + 1
            }));
        return schedule;
    }
}
;