import { jest } from '@jest/globals';
import { validateField } from '../../../src/core/validation/fieldValidator.js';

describe('Validator: validateField', () => {

    it('should return a required field error if no value is provided', () => {
        const fieldName = 'testField';
        const expectedError = { [fieldName]: `O campo '${fieldName}' é obrigatório` };

        const mockValidator = jest.fn();

        expect(validateField(null, mockValidator, fieldName)).toEqual(expectedError);
        expect(validateField(undefined, mockValidator, fieldName)).toEqual(expectedError);
    });

    it('should return null and call the validator function on successful validation', () => {
        const fieldValue = 'some-value';
        const fieldName = 'testField';

        const mockValidator = jest.fn().mockReturnValue('validTestField');

        const result = validateField(fieldValue, mockValidator, fieldName);

        expect(result).toBeNull();
        expect(mockValidator).toHaveBeenCalledTimes(1);
        expect(mockValidator).toHaveBeenCalledWith(fieldValue, fieldName);
    });

    it('should return an error object from the validator function on failed validation', () => {
        const fieldValue = 'invalid-value';
        const fieldName = 'testField';
        const errorFromValidator = { [fieldName]: 'Valor inválido' };

        const mockValidator = jest.fn().mockReturnValue(errorFromValidator);

        const result = validateField(fieldValue, mockValidator, fieldName);

        expect(result).toEqual(errorFromValidator);
        expect(mockValidator).toHaveBeenCalledTimes(1);
        expect(mockValidator).toHaveBeenCalledWith(fieldValue, fieldName);
    });
});
