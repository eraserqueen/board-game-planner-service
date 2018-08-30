module.exports = {
    getPlayer: jest.fn().mockName('getPlayerMock'),
    addPlayer: jest.fn().mockName('addPlayerMock'),
    getGames: jest.fn().mockName('getGamesMock'),
    setGames: jest.fn().mockName('setGamesMock'),
};