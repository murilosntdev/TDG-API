import { activeRooms } from "./rooms.handlers.js";

export function disconnectHandler(socket) {
    for (const [roomId, roomData] of Object.entries(activeRooms)) {
        if (roomData.players.includes(socket.user)) {
            roomData.players = roomData.players.filter((playerUsername) => playerUsername !== socket.user);

            socket.leave(roomId);

            if (roomData.players.length === 0) {
                delete activeRooms[roomId];
            };
        };
    };
};