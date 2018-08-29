const _ = require('lodash');
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

function tryAgainIfNoResults(res) {
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

function giveUpIfStillNoResults(res) {
    if (res.status === 202) {
        return Promise.reject('Did not receive results after 3 attempts');
    }
    return res;
}


function parseXml(res) {
    const xml2js = require('xml-js').xml2js;
    const parsed = xml2js(res.body, {compact: true, nativeType: true, ignoreDeclaration: true});
    if (parsed.errors) {
        return Promise.reject(_.get(parsed, 'errors.error.message._text', 'unknown error'));
    }
    return parsed;
}

module.exports = {
    host: 'www.boardgamegeek.com',
    port: 443,
    init: ({host, port}) => {
        this.host = host;
        this.port = port;
    },
    getCollectionAsync: (username) => {
        const options = {
            hostname: this.host,
            port: this.port,
            method: 'GET',
            path: `/xmlapi/collection/${username}?subtype=boardgame&stats=1&own=1`
        };
        return makeRequest(options)
            .then(tryAgainIfNoResults)
            .then(tryAgainIfNoResults)
            .then(giveUpIfStillNoResults)
            .then(parseXml);
    }
};