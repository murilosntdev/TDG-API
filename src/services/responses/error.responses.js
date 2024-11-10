export const errorResponse = (statusCode, details, debugInfo) => {
    const response = {
        error: {}
    };

    switch (statusCode) {
        case 409: {
            response.error.status = 409;
            response.error.message = "Houve Um Conflito No Servidor";
            break;
        };
        case 422: {
            response.error.status = 422;
            response.error.message = "Entidade Não Processável";
            break;
        };
        case 503: {
            response.error.status = 503;
            response.error.message = "Serviço Indisponível";
            break;
        };
        default: {
            response.error.status = 500;
            response.error.message = "Erro do Servidor Interno";
            break;
        };
    };

    if (details) {
        response.error.details = details;
    };

    if (process.env.SYSTEM_SHOW_DEBUG_INFO === "true" && debugInfo) {
        response.error.debugInfo = debugInfo;
    };

    return (response);
};