const statusMessage = {
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    422: "Unprocessable content",
    503: "Service unavailable",
    500: "Internal server error"
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