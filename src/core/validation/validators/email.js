export const validateEmail = (content, fieldName) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (typeof content !== "string") {
        return { [fieldName]: `The '${fieldName}' field must be a string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `The '${fieldName}' field is required` };
    };
    if (content.length < 6 || content.length > 254) {
        return { [fieldName]: `The '${fieldName}' field must be between 6 and 254 characters` };
    };
    if (!regex.test(content)) {
        return { [fieldName]: `The '${fieldName}' field must contain a valid email address` };
    };

    return 'validEmail';
};