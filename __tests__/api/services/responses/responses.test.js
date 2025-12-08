import { jest } from '@jest/globals';
import { successResponse } from "../../../../src/api/services/responses/success.responses.js";
import { errorResponse } from "../../../../src/api/services/responses/error.responses.js";

describe('Service: successResponse', () => {
    it('should return a formatted 200 OK response', () => {
        const response = successResponse(200);
        expect(response).toEqual({
            status: 200,
            message: "OK"
        });
    });

    it('should return a formatted 201 Created response with details', () => {
        const details = { userId: 1, username: 'test' };
        const response = successResponse(201, details);
        expect(response).toEqual({
            status: 201,
            message: "Created",
            details: {
                userId: 1,
                username: 'test'
            }
        });
    });

    it('should return a 204 No Content response for an unhandled success status code', () => {
        const response = successResponse(299);
        expect(response).toEqual({
            status: 204,
            message: "No content"
        });
    });
});

describe('Service: errorResponse', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });
    afterAll(() => {
        process.env = originalEnv;
    });

    it('should return a formatted 404 Not Found response', () => {
        const response = errorResponse(404);
        expect(response).toEqual({
            error: {
                status: 404,
                message: "Not found"
            }
        });
    });

    it('should return a formatted 422 Unprocessable Entity response with details', () => {
        const details = [{ field: 'email', message: 'invalid format' }];
        const response = errorResponse(422, details);
        expect(response).toEqual({
            error: {
                status: 422,
                message: "Unprocessable content",
                details: [{
                    field: 'email',
                    message: 'invalid format'
                }]
            }
        });
    });

    it('should return a 500 Internal Server Error for an unhandled error status code', () => {
        const response = errorResponse(999);
        expect(response.error.status).toBe(500);
        expect(response.error.message).toBe("Internal server error");
    });

    it('should not include debugInfo if SYSTEM_SHOW_DEBUG_INFO is not "true"', () => {
        process.env.SYSTEM_SHOW_DEBUG_INFO = 'false';
        const debugInfo = { query: 'SELECT *' };
        const response = errorResponse(503, null, debugInfo);
        expect(response.error.debugInfo).toBeUndefined();
    });

    it('should include debugInfo if SYSTEM_SHOW_DEBUG_INFO is set to "true"', () => {
        process.env.SYSTEM_SHOW_DEBUG_INFO = 'true';
        const debugInfo = { query: 'SELECT *' };
        const response = errorResponse(503, null, debugInfo);
        expect(response.error.debugInfo).toEqual(debugInfo);
    });
});
