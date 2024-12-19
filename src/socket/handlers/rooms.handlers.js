import { validateRoomName } from "../services/validators/roomName.validators.js";
import { validateRoomId } from "../services/validators/roomId.validators.js";

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
        players: [socket.user]
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
        if (roomData.players.includes(socket.user)) {
            socket.leave(roomId);
            roomData.players = roomData.players.filter((playerUsername) => playerUsername !== socket.user);

            if (roomData.players.length === 0) {
                delete activeRooms[roomId];
            };
        };
    };

    return;
};

export function findRoomsHandler(socket) {
    const rooms = Object.entries(activeRooms).map(([roomId, roomData]) => ({
        id: roomId,
        name: roomData.name,
        players: roomData.players.length
    }));

    const responseMessage = {
        status: "success",
        message: "Salas encontradas",
        details: rooms
    }

    socket.emit("rooms", responseMessage);
};

export function joinRoomHandler(socket, body) {
    const roomId = body.room_id;

    let inputErrors = [];

    if (!roomId) {
        inputErrors.push({ "room_id": "o campo 'room_id' é obrigatório" });
    } else {
        let validRoomId = validateRoomId(roomId, "room_id");

        if (validRoomId != "validRoomId") {
            inputErrors.push(validRoomId);
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

    const room = activeRooms[roomId];

    if (!room) {
        const responseMessage = {
            "status": "error",
            "message": "Sala não encontrada",
            "details": `A sala '${roomId}' não existe`
        };

        socket.emit("error", responseMessage);
        return;
    };

    removePlayerFromCurrentRoom(socket);

    socket.join(roomId);
    room.players.push(socket.user);

    const responseMessage = {
        "status": "success",
        "message": "Conexão com a sala",
        "details": {
            "room_info": {
                "id": roomId,
                "name": activeRooms[roomId].name,
                "players_quantity": activeRooms[roomId].players.length,
                "players_usernames": activeRooms[roomId].players
            }
        }
    }

    socket.emit("roomJoined", responseMessage);
};