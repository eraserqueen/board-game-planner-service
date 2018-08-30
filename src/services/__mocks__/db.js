module.exports = () => ({
    checkCredentials: jest.fn().mockName('checkCredentialsMock'),
    findUser: jest.fn().mockName('findUserMock'),
    addNewUser: jest.fn().mockName('addNewUserMock'),
    getGamesList: jest.fn().mockName('getGamesListMock'),
    setGamesList: jest.fn().mockName('setGamesListMock'),
});