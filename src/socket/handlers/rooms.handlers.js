import { validateRoomName } from "../services/validators/roomName.validators.js";

const activeRooms = {};

export function createRoomHandler(socket, body) {
    const roomName = body.roomName;

    let inputErrors = [];

    if (!roomName) {
        inputErrors.push({ "roomName": "o campo 'roomName' é obrigatório" });
    } else {
        let validRoomName = validateRoomName(roomName, "roomName");

        if (validRoomName != "validRoomName") {
            inputErrors.push(validRoomName);
        };
    };

    if (inputErrors.length > 0) {
        const responseMessage = {
            "status": "error",
            "data": inputErrors
        };

        socket.emit("error", responseMessage);
        return;
    };

    removePlayerFromCurrentRoom(socket);

    const roomId = `room-${Math.random().toString(36).substring(2, 10)}`;

    socket.join(roomId);

    activeRooms[roomId] = {
        name: roomName,
        players: [socket.id]
    };

    socket.emit("roomCreated", { roomId, roomName });
};

function removePlayerFromCurrentRoom(socket) {
    for (const [roomId, roomData] of Object.entries(activeRooms)) {
        if (roomData.players.includes(socket.id)) {
            socket.leave(roomId);
            roomData.players = roomData.players.filter((playerId) => playerId !== socket.id);

            if (roomData.players.length === 0) {
                delete activeRooms[roomId];
            };
        };
    };

    return;
};