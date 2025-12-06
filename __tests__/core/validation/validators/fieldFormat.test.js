import { validateStringField } from "../../../../src/core/validation/validators/fieldFormat.js";

describe('Validator: validateStringField', () => {

    it('should return "validString" for a valid string fields', () => {
        const validStrings = ['.', 'testString', 'test string', '123456'];
        validStrings.forEach(string => {
            expect(validateStringField(string, 'string')).toBe('validString');
        });
    });
    
    it('should return an error object for non-string inputs', () => {
        const nonStringInput = 12345;
        const expectedError = { string: "O campo 'string' deve conter uma string" };
        expect(validateStringField(nonStringInput, 'string')).toEqual(expectedError);
    });
    
    it('should return an error object for empty or whitespace-only string fields', () => {
        const emptyString = '   ';
        const expectedError = { string: "O campo 'string' é obrigatório" };
        expect(validateStringField(emptyString, 'string')).toEqual(expectedError);
    });
});
