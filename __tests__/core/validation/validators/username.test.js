import { validateUsername } from "../../../../src/core/validation/validators/username.js";

describe('Validator: validateUsername', () => {

    it('should return "validUsername" for a valid username', () => {
        const validUsernames = ['testeUser', 'test_user', 'user123', 'test.user'];
        validUsernames.forEach(username => {
            expect(validateUsername(username, 'username')).toBe('validUsername');
        });
    });

    it('should return an error object for non-string inputs', () => {
        const nonStringInput = 12345;
        const expectedError = { username: "The 'username' field must be a string" };
        expect(validateUsername(nonStringInput, 'username')).toEqual(expectedError);
    });

    it('should return an error object for empty or whitespace-only usernames', () => {
        const emptyUsername = '   ';
        const expectedError = { username: "The 'username' field is required" };
        expect(validateUsername(emptyUsername, 'username')).toEqual(expectedError);
    });

    it('should return an error object for usernames that are too short', () => {
        const shortUsername = 'abcd';
        const expectedError = { username: "The 'username' field must be between 5 and 20 characters" };
        expect(validateUsername(shortUsername, 'username')).toEqual(expectedError);
    });

    it('should return an error object for usernames that are too long', () => {
        const longUsername = 'a'.repeat(21);
        const expectedError = { username: "The 'username' field must be between 5 and 20 characters" };
        expect(validateUsername(longUsername, 'username')).toEqual(expectedError);
    });

    it('should return an error object for usernames with invalid characters', () => {
        const invalidUsernames = ['@testUser', 'user!', '1user'];
        const expectedError = { username: "The 'username' field contains invalid characters" };
        invalidUsernames.forEach(username => {
            expect(validateUsername(username, 'username')).toEqual(expectedError);
        });
    });
});
