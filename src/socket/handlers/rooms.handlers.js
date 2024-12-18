import { validateRoomName } from "../services/validators/roomName.validators.js";

const activeRooms = {};

export function createRoomHandler(socket, body) {
    const roomName = body.room_name;

    let inputErrors = [];

    if (!roomName) {
        inputErrors.push({ "room_name": "o campo 'room_name' é obrigatório" });
    } else {
        let validRoomName = validateRoomName(roomName, "room_name");

        if (validRoomName != "validRoomName") {
            inputErrors.push(validRoomName);
        };
    };

    if (inputErrors.length > 0) {
        const responseMessage = {
            "status": "error",
            "message": "Erro de input",
            "details": inputErrors
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

    const responseMessage = {
        "status": "success",
        "message": "Sala criada",
        "details": {
            "room_info": {
                id: roomId,
                name: roomName
            }
        }
    };

    socket.emit("roomCreated", responseMessage);
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

export function findRoomsHandler(socket) {
    const rooms = Object.entries(activeRooms).map(([roomId, roomData]) => ({
        roomId,
        roomName: roomData.name,
        players: roomData.players.length
    }));

    socket.emit("rooms", { rooms });
};