const schedulerController = require('../schedulerController');
const scheduler = require('../../services/scheduler');
jest.mock('../../services/scheduler');

describe('Scheduler Controller', () => {
    const next = jest.fn();
    const resJsonMock = jest.fn();
    const res = {
        status: jest.fn().mockReturnValue({json: resJsonMock}),
    };
    let baseReq = {};
    beforeEach(() => {
        baseReq = {
            method: 'PUT',
            path: '/events',
            query: {
                runScheduler: 'true'
            },
            body: {
                playerPreferences: ['a', 'b', 'c']
            }
        };
    });
    test('runs scheduler before forwarding the request', () => {
        scheduler.run = jest.fn().mockReturnValue([1, 2, 3]);

        const validReq = Object.assign({}, baseReq);
        schedulerController(validReq, res, next);

        expect(scheduler.run).toHaveBeenCalledWith(baseReq.body);
        expect(validReq.body.schedule).toEqual([1, 2, 3]);
        expect(next).toHaveBeenCalled();

    });
    [
        Object.assign({}, baseReq, {method: 'GET'}),
        Object.assign({}, baseReq, {path: '/not/a/valid/path'}),
        Object.assign({}, baseReq, {query: {}}),
        Object.assign({}, baseReq, {query: {runScheduler: 'false'}}),
        Object.assign({}, baseReq, {body: undefined}),
        Object.assign({}, baseReq, {body: {}}),
    ].forEach(badRequest =>
        test('does not run when request is invalid', () => {
            scheduler.run = jest.fn();
            schedulerController(badRequest, res, next);
            expect(scheduler.run).not.toHaveBeenCalled();
            expect(baseReq.body.schedule).toBeUndefined();
            expect(next).toHaveBeenCalled();
        })
    );
});