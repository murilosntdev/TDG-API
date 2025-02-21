import { validateRoomName } from "../services/validators/roomName.validators.js";
import { validateRoomId } from "../services/validators/roomId.validators.js";
import { createGameInstance, addPlayerToGame, removePlayerFromGame, deleteGameInstance, startGame, handsPrediction, playCard } from "./game.handlers.js";
import { validateHandsQuantity } from "../services/validators/handsQuantity.validators.js";
import { validateCard } from "../services/validators/card.validators.js";

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

export function handsPredictionHandler(io, socket, body) {
    const roomId = body.room_id;
    const handsQuantity = body.hands_quantity;

    let inputErrors = [];

    if (!roomId) {
        inputErrors.push({ "room_id": "o campo 'room_id' é obrigatório" });
    } else {
        let validRoomId = validateRoomId(roomId, "room_id");

        if (validRoomId != "validRoomId") {
            inputErrors.push(validRoomId);
        };
    };

    if (handsQuantity === null || handsQuantity === undefined) {
        inputErrors.push({ "hands_quantity": "o campo 'hands_quantity' é obrigatório" });
    } else {
        let validHandsQuantity = validateHandsQuantity(handsQuantity, "hands_quantity");

        if (validHandsQuantity != "validHandsQuantity") {
            inputErrors.push(validHandsQuantity);
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
            "details": `Não foi possível receber previsões de mãos na sala '${roomId}'`
        };

        socket.emit("error", responseMessage);
        return;
    };

    if (room.gameInstance.status !== "awaiting predictions") {
        const responseMessage = {
            "status": "error",
            "message": "Status incompatível",
            "details": `A sala '${roomId}' não está recebendo previsões de mãos`
        };

        socket.emit("error", responseMessage);
        return;
    };

    try {
        handsPrediction(room.gameInstance, socket.user, handsQuantity);

        socket.to(roomId).emit("handsPredicted", {
            "status": "info",
            "message": `${socket.user} preveu ${handsQuantity} mãos`,
            "details": {
                "player_info": {
                    "username": socket.user,
                    "hands_predicted": handsQuantity
                }
            }
        });

        const responseMessage = {
            "status": "success",
            "message": `Você preveu ${handsQuantity} mãos`,
            "details": {
                "player_info": {
                    "hands_predicted": handsQuantity
                }
            }
        };

        socket.emit("handsPredicted", responseMessage);

        Object.keys(room.gameInstance.players).forEach(username => {
            const socketId = room.gameInstance.players[username].socketId;
            const nextPlayerUsername = Object.keys(room.gameInstance.players)[((room.gameInstance.nextPlayerIndex - 1) % Object.keys(room.gameInstance.players).length) + 1];

            var message = '';

            if (room.gameInstance.status === "awaiting predictions") {
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
                            "game_status": room.gameInstance.status
                        }
                    }
                };

                io.to(socketId).emit("nextMove", nextMoveResponseMessage);
            } else if (room.gameInstance.status === "awaiting cards") {
                if (nextPlayerUsername === username) {
                    message = "Escolha uma carta para jogar"
                } else {
                    message = `Vez de ${nextPlayerUsername} escolher uma carta para jogar`
                };

                const nextMoveResponseMessage = {
                    "status": "success",
                    "message": message,
                    "details": {
                        "room_info": {
                            "id": roomId,
                            "game_status": room.gameInstance.status
                        }
                    }
                };

                io.to(socketId).emit("nextMove", nextMoveResponseMessage);
            };
        });
    } catch (error) {
        socket.emit("error", {
            status: "error",
            message: "Erro ao receber previsão de mãos",
            details: error.message
        });
    };
};

export function playCardHandler(io, socket, body) {
    const roomId = body.room_id;
    const card = body.card;

    let inputErrors = [];

    if (!roomId) {
        inputErrors.push({ "room_id": "O campo 'room_id' é obrigatório" });
    } else {
        let validRoomId = validateRoomId(roomId, "room_id");

        if (validRoomId != "validRoomId") {
            inputErrors.push(validRoomId);
        };
    };

    if (!card) {
        inputErrors.push({ "card": "O campo 'card' é obrigatório" });
    } else {
        let validCard = validateCard(card, "card");

        if (validCard != "validCard") {
            inputErrors.push(validCard);
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
            "details": `Não foi possível jogar uma carta na sala '${roomId}'`
        };

        socket.emit("error", responseMessage);
        return;
    };

    if (room.gameInstance.status !== "awaiting cards") {
        const responseMessage = {
            "status": "error",
            "message": "Status incompatível",
            "details": `A sala '${roomId}' não está recebendo cartas`
        };

        socket.emit("error", responseMessage);
        return;
    };

    try {
        playCard(io, roomId, room.gameInstance, socket.user, card);

        socket.to(roomId).emit("cardPlayed", {
            "status": "info",
            "message": `${socket.user} jogou a carta ${card}`,
            "details": {
                "player_info": {
                    "username": socket.user,
                    "played_card": card
                }
            }
        });

        const responseMessage = {
            "status": "success",
            "message": `Você jogou a carta ${card}`,
            "details": {
                "player_info": {
                    "played_card": card,
                    "cards": activeRooms[roomId].gameInstance.players[socket.user].cards
                }
            }
        };

        socket.emit("cardPlayed", responseMessage);

        Object.keys(room.gameInstance.players).forEach(username => {
            const socketId = room.gameInstance.players[username].socketId;
            const nextPlayerUsername = Object.keys(room.gameInstance.players)[((room.gameInstance.nextPlayerIndex - 1) % Object.keys(room.gameInstance.players).length) + 1];

            var message = '';

            if (room.gameInstance.status === "awaiting cards") {
                if (nextPlayerUsername === username) {
                    message = "Escolha uma carta para jogar"
                } else {
                    message = `Vez de ${nextPlayerUsername} escolher uma carta para jogar`
                };

                const nextMoveResponseMessage = {
                    "status": "success",
                    "message": message,
                    "details": {
                        "room_info": {
                            "id": roomId,
                            "game_status": room.gameInstance.status
                        }
                    }
                };

                io.to(socketId).emit("nextMove", nextMoveResponseMessage);
            };
        });
    } catch (error) {
        socket.emit("error", {
            status: "error",
            message: "Erro ao receber carta",
            details: error.message
        });
    };
};