export const validateHandsQuantity = (content, fieldName) => {
    if (typeof content !== "number") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma número inteiro` };
    };
    if (!Number.isInteger(content)) {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma número inteiro` };
    };
    if (content < 0 || content > 20) {
        return { [fieldName]: `O campo '${fieldName}' deve variar de 0 a 20` };
    };

    return 'validHandsQuantity';
};