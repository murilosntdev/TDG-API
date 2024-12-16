export const validateEmail = (content, fieldName) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length < 6 || content.length > 254) {
        return { [fieldName]: `O campo '${fieldName}' deve conter de 6 a 254 caracteres` };
    };
    if (!regex.exec(content)) {
        return { [fieldName]: `O campo '${fieldName}' deve conter um email válido` };
    };

    return 'validEmail';
};