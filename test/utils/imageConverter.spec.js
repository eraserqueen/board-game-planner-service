const path = require('path');
const fs = require('fs');

const converter = require('../../src/utils/imageConverter');


describe('Image Converter', () => {
    describe('from file', () => {
        test('should output a data-uri when the file exists', async () => {
            const expected = fs.readFileSync(path.join(__dirname, 'testPic.jpg.data'), 'utf8');
            const actual = await converter.fromFile(path.join(__dirname, 'testPic.jpg'));
            expect(actual).toEqual(expected);
        });
        test('should return null when file does not exist', async () => {
            expect(await converter.fromFile('invalid.jpg')).toBeNull();
        });
        test('should return null when file extension is not supported', async () => {
            expect(await converter.fromFile('invalid')).toBeNull();
            expect(await converter.fromFile('invalid.tiff')).toBeNull();
        });
    });
    describe('from url', () => {
        test('should output a data-uri when the file exists', async () => {
            const expected = fs.readFileSync(path.join(__dirname, 'testPic.jpg.data'), 'utf8');
            const actual = await converter.fromUrl('https://cf.geekdo-images.com/itemrep/img/bH4Gk0w5kDGd4MR0DTt8jMI6vo8=/fit-in/246x300/pic4254509.jpg');
            expect(actual).toEqual(expected);
        });
        test('should return null when file does not exist', async () => {
            expect(await converter.fromUrl('http://invalid/path/to/file.jpg')).toBeNull();
        });
        test('should return null when file extension is not supported', async () => {
            expect(await converter.fromUrl('http://invalid/path/to/file')).toBeNull();
            expect(await converter.fromUrl('http://invalid/path/to/file.tiff')).toBeNull();
        });
    });
});