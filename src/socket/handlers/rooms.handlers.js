import { validateRoomName } from "../services/validators/roomName.validators.js";
import { validateRoomId } from "../services/validators/roomId.validators.js";
import { createGameInstance, addPlayerToGame, removePlayerFromGame, deleteGameInstance, startGame } from "./game.handlers.js";

export const activeRooms = {};

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
        roomInfo: {
            name: roomName,
            players: []
        },
        gameInstance: createGameInstance()
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
        if (roomData.roomInfo.players.includes(socket.user)) {
            socket.leave(roomId);
            roomData.roomInfo.players = roomData.roomInfo.players.filter((playerUsername) => playerUsername !== socket.user);

            removePlayerFromGame(roomData.gameInstance, socket.user);

            if (roomData.roomInfo.players.length === 0) {
                deleteGameInstance(roomData.gameInstance);
                delete activeRooms[roomId];
            };
        };
    };

    return;
};

export function findRoomsHandler(socket) {
    const rooms = Object.entries(activeRooms).map(([roomId, roomData]) => ({
        id: roomId,
        name: roomData.roomInfo.name,
        players: roomData.roomInfo.players.length
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

    removePlayerFromCurrentRoom(socket);

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

    socket.join(roomId);
    room.roomInfo.players.push(socket.user);

    addPlayerToGame(room.gameInstance, socket);

    socket.to(roomId).emit("playerJoined", {
        "status": "info",
        "message": `Jogador entrou na sala`,
        "details": {
            "player_info": {
                "username": socket.user
            },
            "room_info": {
                "id": roomId,
                "name": activeRooms[roomId].roomInfo.name,
                "players_quantity": activeRooms[roomId].roomInfo.players.length,
                "players_usernames": activeRooms[roomId].roomInfo.players
            }
        }
    });

    const responseMessage = {
        "status": "success",
        "message": "Conexão com a sala",
        "details": {
            "room_info": {
                "id": roomId,
                "name": activeRooms[roomId].roomInfo.name,
                "players_quantity": activeRooms[roomId].roomInfo.players.length,
                "players_usernames": activeRooms[roomId].roomInfo.players
            }
        }
    };

    socket.emit("roomJoined", responseMessage);
};

export function leaveRoomHandler(socket, body) {
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

    socket.leave(roomId);
    room.roomInfo.players = room.roomInfo.players.filter((playerUsername) => playerUsername !== socket.user);

    removePlayerFromGame(room.gameInstance, socket.user);

    socket.to(roomId).emit("playerLeft", {
        "status": "info",
        "message": `Jogador saiu da sala`,
        "details": {
            "player_info": {
                "username": socket.user
            },
            "room_info": {
                "id": roomId,
                "name": activeRooms[roomId].roomInfo.name,
                "players_quantity": activeRooms[roomId].roomInfo.players.length,
                "players_usernames": activeRooms[roomId].roomInfo.players
            }
        }
    });

    if (room.roomInfo.players.length === 0) {
        room.gameInstance = deleteGameInstance(room.gameInstance);

        delete activeRooms[roomId];
    };

    const responseMessage = {
        "status": "success",
        "message": "Desconexão com a sala",
        "details": {
            "room_info": {
                "id": roomId
            }
        }
    };

    socket.emit("roomLeft", responseMessage);
};

export function startGameHandler(io, socket, body) {
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

    if (!room.roomInfo.players.includes(socket.user)) {
        const responseMessage = {
            "status": "error",
            "message": "Jogador não pertence a sala",
            "details": `Não foi possível iniciar jogo na sala '${roomId}'`
        };

        socket.emit("error", responseMessage);
        return;
    };

    if (room.gameInstance.status !== "awaiting players") {
        const responseMessage = {
            "status": "error",
            "message": "Jogo ativo",
            "details": `A sala '${roomId}' já conta com um jogo ativo`
        };

        socket.emit("error", responseMessage);
        return;
    };

    try {
        const updatedGameState = startGame(io, room.gameInstance);

        room.gameInstance = {
            ...room.gameInstance,
            round: 1,
            hand: 1,
            nextPlayerIndex: 0,
            predictedHands: {},
            playedCards: {}
        };

        Object.keys(room.gameInstance.players).forEach(username => {
            const socketId = room.gameInstance.players[username].socketId;
            const lives = room.gameInstance.players[username].lives;
            const predictedHands = room.gameInstance.players[username].predictedHands;
            const handsWon = room.gameInstance.players[username].handsWon;

            const gameStartedResponseMessage = {
                "status": "success",
                "message": "O jogo começou",
                "details": {
                    "room_info": {
                        "id": roomId,
                        "game_status": updatedGameState.status
                    },
                    "player_info": {
                        "lives": lives,
                        "predictedHands": predictedHands,
                        "handsWon": handsWon
                    }
                }
            };

            io.to(socketId).emit("gameStarted", gameStartedResponseMessage);

            const nextPlayerUsername = Object.keys(room.gameInstance.players)[room.gameInstance.nextPlayerIndex];

            var message = '';

            if (nextPlayerUsername === username) {
                message = "Diga quantas mãos pretende fazer"
            } else {
                message = `Vez de ${nextPlayerUsername} dizer quantas mãos pretende fazer`
            };

            const nextMoveResponseMessage = {
                "status": "success",
                "message": message,
                "details": {
                    "room_info": {
                        "id": roomId,
                        "game_status": updatedGameState.status
                    }
                }
            };

            io.to(socketId).emit("nextMove", nextMoveResponseMessage);
        });
    } catch (error) {
        socket.emit("error", {
            status: "error",
            message: "Erro ao iniciar o jogo",
            details: error.message
        });
    };
};