export const validatePassword = (content, fieldName) => {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{8,15}$/;

    if (typeof content !== "string") {
        return { [fieldName]: `The '${fieldName}' field must be a string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `The '${fieldName}' field is required` };
    };
    if (content.length < 8 || content.length > 15) {
        return { [fieldName]: `The '${fieldName}' field must be between 8 and 15 characters` };
    };
    if (!regex.test(content)) {
        return { [fieldName]: `The '${fieldName}' field must contain at least one uppercase letter, one lowercase letter, and one number` };
    };

    return 'validPassword';
};