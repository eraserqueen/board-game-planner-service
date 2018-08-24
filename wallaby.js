module.exports = function () {
    return {
        files: [
            'data/**/*',
            'src/**/*',
            '!src/**/*.spec.js',
            '!src/utils/errorMessages.js',
            {pattern: 'package.json', instrument: false},
            {pattern:'jest.config.js', instrument:false},
            {pattern:'server.js', instrument: false}
        ],

        tests: [
            'src/**/__tests__/*.spec.js'
        ],

        testFramework: 'jest',

        env: {
            type: 'node',
            runner: 'node'
        },
        setup: function (wallaby) {
            const jestConfig = require('./jest.config.js');
            wallaby.testFramework.configure(jestConfig);
        },
        debug: true,

    };
};