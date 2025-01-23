import { deleteGameInstance, removePlayerFromGame } from "./game.handlers.js";
import { activeRooms } from "./rooms.handlers.js";

export function disconnectHandler(socket) {
    for (const [roomId, roomData] of Object.entries(activeRooms)) {
        if (roomData.players.includes(socket.user)) {
            roomData.players = roomData.players.filter((playerUsername) => playerUsername !== socket.user);

            removePlayerFromGame(activeRooms[roomId].gameInstance, socket.user);

            socket.leave(roomId);

            if (roomData.players.length === 0) {
                deleteGameInstance(room.gameInstance);
                delete activeRooms[roomId];
            };

            socket.to(roomId).emit("playerLeft", {
                "status": "info",
                "message": `Jogador saiu da sala`,
                "details": {
                    "player_info": {
                        "username": socket.user
                    }
                }
            });
        };
    };
};