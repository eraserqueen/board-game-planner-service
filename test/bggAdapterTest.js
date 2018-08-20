const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');

const bggAdapter = require('../src/bggAdapter');


describe('BGG Adapter', () => {
    it('maps invalid collection to empty games list', () => {
        expect(bggAdapter.mapCollectionToGamesList("invalid")).to.eql([]);
    });
    it('maps collection to games list', () => {
        const xml = fs.readFileSync(path.join(__dirname, '__mocks/bgg-collection-single-item-response.xml'), 'utf8');
        const gamesList = bggAdapter.mapCollectionToGamesList(xml);
        expect(gamesList).to.have.lengthOf(1);
        expect(gamesList[0].title).to.eq('Battlestar Galactica: The Board Game');
        expect(gamesList[0].image).to.eq("https://cf.geekdo-images.com/thumb/img/NpZjJd2NgxSJV2WrlB_U1e89txY=/fit-in/200x150/pic354500.jpg");
        expect(gamesList[0].minPlayers).to.eq(3);
        expect(gamesList[0].maxPlayers).to.eq(6);
        expect(gamesList[0].playingTime).to.eq(300);
    })
});
