const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');

const converter = require('../../src/utils/imageConverter');


describe('Image Converter', () => {
    describe('from file', () => {
        it('should output a data-uri when the file exists', async () => {
            const expected = fs.readFileSync(path.join(__dirname, 'testPic.jpg.data'), 'utf8');
            const actual = await converter.fromFile(path.join(__dirname, 'testPic.jpg'));
            expect(actual).to.eq(expected);
        });
        it('should return null when file does not exist', async () => {
            expect(await converter.fromFile('invalid.jpg')).to.eq(null);
        });
        it('should return null when file extension is not supported', async () => {
            expect(await converter.fromFile('invalid')).to.eq(null);
            expect(await converter.fromFile('invalid.tiff')).to.eq(null);
        });
    });
    describe('from url', () => {
        it('should output a data-uri when the file exists', async () => {
            const expected = fs.readFileSync(path.join(__dirname, 'testPic.jpg.data'), 'utf8');
            const actual = await converter.fromUrl('https://cf.geekdo-images.com/itemrep/img/bH4Gk0w5kDGd4MR0DTt8jMI6vo8=/fit-in/246x300/pic4254509.jpg');
            expect(actual).to.eq(expected);
        });
        it('should return null when file does not exist', async () => {
            expect(await converter.fromUrl('http://invalid/path/to/file.jpg')).to.eq(null);
        });
        it('should return null when file extension is not supported', async () => {
            expect(await converter.fromUrl('http://invalid/path/to/file')).to.eq(null);
            expect(await converter.fromUrl('http://invalid/path/to/file.tiff')).to.eq(null);
        });
    });
});