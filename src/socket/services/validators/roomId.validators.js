export const validateRoomId = (content, fieldName) => {
    const regex = /^room-[a-z0-9]+$/;

    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length !== 13) {
        return { [fieldName]: `O campo '${fieldName}' deve conter 13 caracteres` };
    };
    if (!regex.exec(content)) {
        return { [fieldName]: `O campo '${fieldName}' contém caracteres inválidos` };
    };

    return 'validRoomId';
};