export const validateUsername = (content, fieldName) => {
    const regex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

    if (typeof content !== "string") {
        return { [fieldName]: `The '${fieldName}' field must be a string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `The '${fieldName}' field is required` };
    };
    if (content.length < 5 || content.length > 20) {
        return { [fieldName]: `The '${fieldName}' field must be between 5 and 20 characters` };
    };
    if (!regex.test(content)) {
        return { [fieldName]: `The '${fieldName}' field contains invalid characters` };
    };

    return 'validUsername';
};