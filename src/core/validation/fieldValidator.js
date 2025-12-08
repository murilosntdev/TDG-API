export const validateField = (value, validatorFn, fieldName, expectedReturn = `valid${capitalize(fieldName)}`) => {
    if (!value) return { [fieldName]: `The '${fieldName}' field is required` };
    const result = validatorFn(value, fieldName);
    return result !== expectedReturn ? result : null;
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);