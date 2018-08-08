const _ = require('lodash');

module.exports = {
    run: (event) => {
        if(_.isEmpty(event.playerPreferences)) {
            return [];
        }
        if(_.uniq(event.playerPreferences.map(p => p.playerName)).length === 1) {
            return event.playerPreferences.map(p => _.omit(p, ['playerName']));
        }
    }
};