const statusMessage = {
    401: "Não Autorizado",
    403: "Acesso Proibido",
    404: "Entidade Não Encontrada",
    409: "Houve Um Conflito No Servidor",
    422: "Entidade Não Processável",
    503: "Serviço Indisponível",
    500: "Erro do Servidor Interno"
};

export const errorResponse = (statusCode, details, debugInfo) => {
    const code = statusMessage[statusCode] ? statusCode : 500;

    const response = {
        error: {
            status: code,
            message: statusMessage[code]
        }
    };

    if (details) {
        response.error.details = details;
    };

    if (process.env.SYSTEM_SHOW_DEBUG_INFO === "true" && debugInfo) {
        response.error.debugInfo = debugInfo;
    };

    return (response);
};