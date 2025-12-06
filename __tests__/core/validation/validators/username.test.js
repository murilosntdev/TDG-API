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
        const expectedError = { username: "O campo 'username' deve ser uma string" };
        expect(validateUsername(nonStringInput, 'username')).toEqual(expectedError);
    });
    
    it('should return an error object for empty or whitespace-only usernames', () => {
        const emptyUsername = '   ';
        const expectedError = { username: "O campo 'username' é obrigatório" };
        expect(validateUsername(emptyUsername, 'username')).toEqual(expectedError);
    });

    it('should return an error object for usernames that are too short', () => {
        const shortUsername = 'abcd';
        const expectedError = { username: "O campo 'username' deve conter de 5 a 20 caracteres" };
        expect(validateUsername(shortUsername, 'username')).toEqual(expectedError);
    });

    it('should return an error object for usernames that are too long', () => {
        const longUsername = 'a'.repeat(21);
        const expectedError = { username: "O campo 'username' deve conter de 5 a 20 caracteres" };
        expect(validateUsername(longUsername, 'username')).toEqual(expectedError);
    });

    it('should return an error object for usernames with invalid characters', () => {
        const invalidUsernames = ['@testUser', 'user!', '1user'];
        const expectedError = { username: "O campo 'username' contém caracteres inválidos" };
        invalidUsernames.forEach(username => {
            expect(validateUsername(username, 'username')).toEqual(expectedError);
        });
    });
});
