const statusMessage = {
    200: "OK",
    201: "Created",
    204: "No content"
};

export const successResponse = (statusCode, details) => {
    const code = statusMessage[statusCode] ? statusCode : 204;

    const response = {
        status: code,
        message: statusMessage[code]
    };

    if (details) {
        response.details = details;
    };

    return (response);
};