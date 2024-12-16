export const validateStringField = (content, fieldName) => {
    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve conter uma string` };
    };

    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };

    return 'validString';
};