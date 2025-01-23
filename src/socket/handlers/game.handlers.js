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
        throw new Error("O jogador não está no jogo");
    };

    delete gameInstance.players[username];
};

export function deleteGameInstance(gameInstance) {
    gameInstance = {};

    return gameInstance;
};