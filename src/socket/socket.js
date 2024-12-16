import { Server } from "socket.io";
import { authMiddleware } from "./middlewares/auth.middlewares.js";

export default function initWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: JSON.parse(process.env.CORS_ORIGIN),
            method: ["GET"]
        }
    });

    io.use(authMiddleware);

    io.on("connection", (socket) => {
        const responseMessage = {
            "status": "success",
            "message": "Conexão bem-sucedida",
            "data": {
                "user": {
                    "username": socket.user,
                    "socket_id": socket.id
                },
                "server": {
                    "connected_users": io.sockets.sockets.size
                }
            }
        };

        socket.emit("connectionSuccess", responseMessage);
    });
};