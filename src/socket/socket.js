import { Server } from "socket.io";
import { authMiddleware } from "./middlewares/auth.middlewares.js";
import { createRoomHandler, findRoomsHandler, joinRoomHandler } from "./handlers/rooms.handlers.js";

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
            "details": {
                "user_info": {
                    "username": socket.user,
                    "socket_id": socket.id
                },
                "server_info": {
                    "connected_users": io.sockets.sockets.size
                }
            }
        };

        socket.emit("connectionSuccess", responseMessage);

        socket.on("createRoom", (body) => createRoomHandler(socket, body));
        socket.on("findRooms", () => findRoomsHandler(socket));
        socket.on("joinRoom", (body) => joinRoomHandler(socket, body));
    });
};