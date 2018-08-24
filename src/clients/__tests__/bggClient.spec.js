const path = require('path');
const fs = require('fs');
const ServerMock = require('mock-http-server');
const bggClient = require('../bggClient');

describe('BGG client', () => {

    let mockServerConfig = {host: 'localhost', port: 9000};
    const server = new ServerMock(mockServerConfig);
    const client = bggClient(mockServerConfig);

    beforeEach((done) => {
        server.start(done);
    });
    afterEach((done) => {
        server.stop(done);
    });

    const acceptedResponseXml = fs.readFileSync(path.join(__dirname, '../__mocks__/getCollectionAcceptedResponse.xml'), 'utf8');
    const okResponseXml = fs.readFileSync(path.join(__dirname, '../__mocks__/getCollectionOkResponse.xml'), 'utf8');
    const errorResponseXml = fs.readFileSync(path.join(__dirname, '../__mocks__/getCollectionErrorResponse.xml'), 'utf8');
    const jsonResponse = JSON.parse(fs.readFileSync(path.join(__dirname, '../__mocks__/getCollectionOkResponse.json'), 'utf8'));

    describe('getCollectionsAsync', () => {
        test('should return collection as json', async () => {
            server.on({
                method: 'GET',
                path: '*',
                reply: {
                    status: 200,
                    body: okResponseXml
                }
            });
            await expect(client.getCollectionAsync('eraserqueen')).resolves.toEqual(jsonResponse);
        });
        test('should try request again when client receives ACCEPTED response code', async () => {
            const succeedOnAttemptNum = 3;
            server.on({
                method: 'GET',
                path: '*',
                reply: {
                    status: () => {
                        if (server.requests().length === succeedOnAttemptNum) {
                            return 200;
                        }
                        return 202;
                    },
                    body: () => {
                        if (server.requests().length === succeedOnAttemptNum) {
                            return okResponseXml;
                        }
                        return acceptedResponseXml;
                    }
                }
            });
            await expect(client.getCollectionAsync('eraserqueen')).resolves.toEqual(jsonResponse);
            expect(server.requests()).toHaveLength(succeedOnAttemptNum);
        });
        test('should return error if server does not return a success response after 3 attempts', async () => {
            server.on({
                method: 'GET',
                path: '*',
                reply: {
                    status: 202,
                    body: acceptedResponseXml
                }
            });
            await expect(client.getCollectionAsync('eraserqueen')).rejects.toThrowError('Did not receive results after 3 attempts');
            expect(server.requests()).toHaveLength(3);
        });
        test('should throw if server returns an error message', async () => {
            server.on({
                method: 'GET',
                path: '*',
                reply: {
                    status: 200,
                    body: errorResponseXml
                }
            });
            await expect(client.getCollectionAsync('eraserqueen')).rejects.toThrowError('Invalid username specified');
            expect(server.requests()).toHaveLength(1);
        });
        test('should throw if server throws', async () => {
            server.on({
                method: 'GET',
                path: '*',
                reply: {
                    status: 500,
                    body: ''
                }
            });
            await expect(client.getCollectionAsync('eraserqueen')).rejects.toThrowError('request failed with status code 500');
            expect(server.requests()).toHaveLength(1);
        });
    });
});
