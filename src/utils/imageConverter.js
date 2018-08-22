'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const url = require('url');

const extTypeMap = {
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.bm': 'image/bmp',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

function fromFile(file) {
    return new Promise((resolve, reject) => {
        const contentType = extTypeMap[path.extname(file)];
        if (!contentType) {
            reject('invalid file extension');
            return;
        }
        fs.readFile(file, 'base64', (err, image) => {
            if(err) {
                reject(err);
            } else {
                resolve(`data:${contentType};base64,${image}`);
            }
        });

    }).catch(err => {
        console.error(err);
        return null;
    });
}

function fromUrl(href) {
    return new Promise((resolve, reject) => {
        const _url = url.parse(href, false, true);

        const contentType = extTypeMap[path.extname(_url.pathname)];
        if (!contentType) {
            reject('invalid file extension');
            return;
        }
        console.log(`retrieve image from ${href}`);
        (_url.protocol === 'https:' ? https : http).get(href, res => {
            if (res.statusCode !== 200) {
                reject(`Request Failed with Status Code: ${res.statusCode}`);
                return;
            }
            res.setEncoding('base64');
            let image = '';
            res.on('data', (chunk) => {
                image += chunk;
            });
            res.on('end', () => {
                resolve(`data:${contentType};base64,${image}`);
            });
        }).on('error', (e) => {
            reject(`Got error: ${e.message}`);
        });
    }).catch(err => {
        console.error(err);
        return null;
    });
}

module.exports = {
    fromFile,
    fromUrl
};