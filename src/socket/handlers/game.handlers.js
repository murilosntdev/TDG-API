import { shuffleDeck } from "../services/deck/deck.utils.js";

export function createGameInstance() {
    return {
        status: "awaiting players",
        players: {}
    };
};

export function addPlayerToGame(gameInstance, socket) {
    const username = socket.user;
    const socketId = socket.id;

    if (gameInstance.players[username]) {
        throw new Error("O jogador já está no jogo");
    };

    gameInstance.players[username] = {
        socketId: socketId,
        lives: 0,
        cards: {},
        predictedHands: 0,
        handsWon: 0
    };
};

export function removePlayerFromGame(gameInstance, username) {
    if (!gameInstance.players[username]) {
        return ("O jogador não está no jogo");
    };

    delete gameInstance.players[username];
};

export function deleteGameInstance(gameInstance) {
    gameInstance = {};

    return gameInstance;
};

export function startGame(io, gameInstance) {
    if (Object.keys(gameInstance.players).length < 2) {
        throw new Error("O jogo precisa de pelo menos 2 jogadores para começar.");
    };

    Object.keys(gameInstance.players).forEach(username => {
        gameInstance.players[username] = {
            ...gameInstance.players[username],
            lives: 3,
            cards: {},
            predictedHands: 0,
            handsWon: 0
        };
    });

    gameInstance.status = "awaiting predictions";

    distributeCards(gameInstance, 1);

    Object.keys(gameInstance.players).forEach(username => {
        const socketId = gameInstance.players[username].socketId;
        const playerCards = gameInstance.players[username].cards;

        const responseMessage = {
            "status": "success",
            "message": "Suas cartas foram distribuídas",
            "details": {
                "cards": playerCards
            }
        };

        io.to(socketId).emit("receiveCards", responseMessage);
    });

    return gameInstance;
};

function distributeCards(gameInstance, cardQuantity) {
    var deck = shuffleDeck();

    Object.keys(gameInstance.players).forEach(username => {
        const drawnCards = deck.splice(0, cardQuantity);
        const cardsObject = drawnCards.reduce((obj, card) => {
            const [key, value] = Object.entries(card)[0];
            obj[key] = value;
            return obj;
        }, {});

        gameInstance.players[username].cards = cardsObject;
    });
};

export function handsPrediction(gameInstance, username, handsQuantity) {
    const nextPlayerUsername = Object.keys(gameInstance.players)[gameInstance.nextPlayerIndex];

    if (nextPlayerUsername !== username) {
        throw new Error(`Vez de ${nextPlayerUsername} dizer quantas mãos pretende fazer`);
    };

    gameInstance.players[username] = {
        ...gameInstance.players[username],
        predictedHands: handsQuantity
    };

    gameInstance.predictedHands[username] = handsQuantity;
    gameInstance.nextPlayerIndex = (gameInstance.nextPlayerIndex % Object.keys(gameInstance.players).length) + 1;

    if (gameInstance.nextPlayerIndex === Object.keys(gameInstance.players).length) {
        gameInstance.nextPlayerIndex = 0;
    };

    if (Object.keys(gameInstance.predictedHands).length === Object.keys(gameInstance.players).length) {
        gameInstance.status = "awaiting cards";
    };

    return gameInstance;
};