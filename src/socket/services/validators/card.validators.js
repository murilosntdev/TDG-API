export const validateCard = (content, fieldName) => {
    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length !== 3) {
        return { [fieldName]: `O campo '${fieldName}' deve conter o valor e o naipe da carta apenas` };
    };

    return 'validCard';
};