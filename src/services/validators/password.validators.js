export const validatePassword = (content, fieldName) => {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{8,15}$/;

    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length < 8 || content.length > 15) {
        return { [fieldName]: `O campo '${fieldName}' deve conter de 8 a 15 caracteres` };
    };
    if (!regex.exec(content)) {
        return { [fieldName]: `O campo '${fieldName}' deve conter uma senha válida` };
    };

    return 'validPassword';
};