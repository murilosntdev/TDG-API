export const validateUsername = (content, fieldName) => {
    const regex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length < 5 || content.length > 20) {
        return { [fieldName]: `O campo '${fieldName}' deve conter de 5 a 20 caracteres` };
    };
    if (!regex.exec(content)) {
        return { [fieldName]: `O campo '${fieldName}' contém caracteres inválidos` };
    };

    return 'validUsername';
};