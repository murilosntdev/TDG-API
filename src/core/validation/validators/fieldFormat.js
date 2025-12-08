export const validateStringField = (content, fieldName) => {
    if (typeof content !== "string") {
        return { [fieldName]: `The '${fieldName}' field must be a string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `The '${fieldName}' field is required` };
    };

    return 'validString';
};