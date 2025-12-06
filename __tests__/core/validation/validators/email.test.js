import { validateEmail } from "../../../../src/core/validation/validators/email.js";

describe('Validator: validateEmail', () => {

    it('should return "validEmail" for a valid email', () => {
        const validEmails = ['teST_+-%123@maIL.-123.com'];
        validEmails.forEach(email => {
            expect(validateEmail(email, 'email')).toBe('validEmail');
        });
    });
    
    it('should return an error object for non-string inputs', () => {
        const nonStringInput = 12345;
        const expectedError = { email: "O campo 'email' deve ser uma string" };
        expect(validateEmail(nonStringInput, 'email')).toEqual(expectedError);
    });
    
    it('should return an error object for empty or whitespace-only emails', () => {
        const emptyEmail = '   ';
        const expectedError = { email: "O campo 'email' é obrigatório" };
        expect(validateEmail(emptyEmail, 'email')).toEqual(expectedError);
    });

    it('should return an error object for emails that are too short', () => {
        const shortEmail = 'a@a.a';
        const expectedError = { email: "O campo 'email' deve conter de 6 a 254 caracteres" };
        expect(validateEmail(shortEmail, 'email')).toEqual(expectedError);
    });

    it('should return an error object for emails that are too long', () => {
        const longEmail = 'a'.repeat(251) + '@a.a';
        const expectedError = { email: "O campo 'email' deve conter de 6 a 254 caracteres" };
        expect(validateEmail(longEmail, 'email')).toEqual(expectedError);
    });

    it('should return an error object for non-valid emails', () => {
        const invalidEmails = ['mail.com.br', 'test@mail', 'test#mail.com'];
        const expectedError = { email: "O campo 'email' deve conter um email válido" };
        invalidEmails.forEach(email => {
            expect(validateEmail(email, 'email')).toEqual(expectedError);
        });
    });
});
