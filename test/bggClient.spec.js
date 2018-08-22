const path = require('path');
const fs = require('fs');
const ServerMock = require('mock-http-server');
const bggClient = require('../src/bggClient');

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

    describe('getCollectionsAsync', () => {
        test('should try request again when status code is 202', async () => {
            const xmlResponse = fs.readFileSync(path.join(__dirname, '__mocks/bgg-collection-sample-response.xml'), 'utf8');
            const succeedOnAttemptNum = 3;
            server.on({
                method: 'GET',
                path: '*',
                reply: {
                    status: () => server.requests().length === succeedOnAttemptNum ? 200 : 202,
                    body: () => {
                        if (server.requests().length === succeedOnAttemptNum) {
                            return xmlResponse;
                        }
                    }
                }
            });
            const collection = await client.getCollectionAsync('eraserqueen');
            expect(collection).toEqual(xmlResponse);
            expect(server.requests()).toHaveLength(succeedOnAttemptNum);
        });
        test(
            'should fail if server does not return a success response after 3 attempts',
            async () => {
                server.on({
                    method: 'GET',
                    path: '*',
                    reply: {status: 202}
                });
                const collection = await client.getCollectionAsync('eraserqueen');
                expect(collection).toBeNull();
                expect(server.requests()).toHaveLength(3);
            }
        );
        test('should fail if server returns an error', async () => {
            server.on({
                method: 'GET',
                path: '*',
                reply: {status: 400}
            });
            const collection = await client.getCollectionAsync('eraserqueen');
            expect(collection).toBeNull();
            expect(server.requests()).toHaveLength(1);
        });
    });
});