const expect = require('chai').expect;
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
        it('should try request again when status code is 202', async () => {
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
            expect(collection).to.eq(xmlResponse);
            expect(server.requests()).to.have.lengthOf(succeedOnAttemptNum);
        });
        it('should fail if server does not return a success response after 3 attempts', async () => {
            server.on({
                method: 'GET',
                path: '*',
                reply: {status: 202}
            });
            const collection = await client.getCollectionAsync('eraserqueen');
            expect(collection).to.be.null;
            expect(server.requests()).to.have.lengthOf(3);
        });
        it('should fail if server returns an error', async () => {
            server.on({
                method: 'GET',
                path: '*',
                reply: {status: 400}
            });
            const collection = await client.getCollectionAsync('eraserqueen');
            expect(collection).to.be.null;
            expect(server.requests()).to.have.lengthOf(1);
        });
    });
});