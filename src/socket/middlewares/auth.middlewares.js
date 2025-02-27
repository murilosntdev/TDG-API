import jsonwebtoken, { decode } from "jsonwebtoken";

const { verify } = jsonwebtoken;

export function authMiddleware(socket, next) {
    const cookies = socket.handshake.headers.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
    }, {});

    const bearerToken = cookies["bearer_token"];

    if (!bearerToken) {
        return next(new Error("o parâmetro 'bearer_token' é obrigatório"));
    };

    try {
        verify(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);
    } catch (error) {
        return next(new Error("'bearer_token' expirado ou inválido"));
    };

    const decodedBearerToken = decode(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);

    socket.user = decodedBearerToken.username;

    next();
};