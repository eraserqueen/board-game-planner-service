module.exports = function () {
    return {
        files: [
            'src/**/*.js',
            'test/db.test.json'
        ],

        tests: [
            'test/**/*Test.js'
        ],

        testFramework: 'mocha',

        env: {
            type: 'node',
            runner: 'node'
        }
    };
};