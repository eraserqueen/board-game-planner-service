const http = require('http');
const https = require('https');
const Promise = require('promise');

function makeRequest(options) {
    return new Promise((resolve, reject) => {
        return (options.port === 443 ? https : http).request(options, (res) => {
            if (res.statusCode === 202) {
                resolve({status: res.statusCode, options});
            }
            else if (res.statusCode === 200) {
                let xml = '';
                res.on('data', (data) => {
                    xml += data;
                });
                res.on('end', () => {
                    resolve({status: res.statusCode, body: xml});
                })
            } else {
                reject(`request failed with status code ${res.statusCode}`);
            }
        }).on('error', (e) => {
            reject(e);
        }).end();
    });
}

function tryAgainIfNeeded(res) {
    /*
    if user collection is not already cached,
    BGG returns a 202 response and expects a
    new request to return the data
    */
    if (res.status === 202) {
        return makeRequest(res.options);
    }
    return res;
}

module.exports = ({host = 'www.boardgamegeek.com', port = 443}) => ({
    getCollectionAsync: (username) => {
        const options = {
            hostname: host,
            port,
            method: 'GET',
            path: `/xmlapi/collection/${username}?subtype=boardgame&stats=1&own=1`
        };
        return makeRequest(options)
            .then(tryAgainIfNeeded)
            .then(tryAgainIfNeeded)
            .then(res => {
                if (res.status === 200 && res.body) return res.body;
                else throw new Error('invalid response from server')
            })
            .catch(err => {
                console.error(err);
                return null;
            });
    }
});