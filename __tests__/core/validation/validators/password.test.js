import { validatePassword } from "../../../../src/core/validation/validators/password.js";

describe('Validator: validatePassword', () => {

    it('should return "validPassword" for a valid password', () => {
        const validPasswords = ['Abcd1234', 'A1b2c3d4', 'aB12c4d3', 'ACBdefg1', 'aA1!@#$%^&*()_+', 'aA1={}[]:;"\'<>', 'aA1,.?/\|-'];
        validPasswords.forEach(password => {
            expect(validatePassword(password, 'password')).toBe('validPassword');
        });
    });

    it('should return an error object for non-string inputs', () => {
        const nonStringInput = 12345;
        const expectedError = { password: "The 'password' field must be a string" };
        expect(validatePassword(nonStringInput, 'password')).toEqual(expectedError);
    });

    it('should return an error object for empty or whitespace-only passwords', () => {
        const emptyPassword = '   ';
        const expectedError = { password: "The 'password' field is required" };
        expect(validatePassword(emptyPassword, 'password')).toEqual(expectedError);
    });

    it('should return an error object for passwords that are too short', () => {
        const shortPassword = 'abcdefg';
        const expectedError = { password: "The 'password' field must be between 8 and 15 characters" };
        expect(validatePassword(shortPassword, 'password')).toEqual(expectedError);
    });

    it('should return an error object for passwords that are too long', () => {
        const longPassword = 'a'.repeat(16);
        const expectedError = { password: "The 'password' field must be between 8 and 15 characters" };
        expect(validatePassword(longPassword, 'password')).toEqual(expectedError);
    });

    it('should return an error object for non-valid passwords', () => {
        const invalidPasswords = ['testpass', 'qwerty123456', 'PASS@#$%'];
        const expectedError = { password: "The 'password' field must contain at least one uppercase letter, one lowercase letter, and one number" };
        invalidPasswords.forEach(password => {
            expect(validatePassword(password, 'password')).toEqual(expectedError);
        });
    });
});
