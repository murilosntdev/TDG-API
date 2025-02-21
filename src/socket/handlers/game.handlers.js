import { cardWithValues, shuffleDeck } from "../services/deck/deck.utils.js";

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

export function playCard(io, roomId, gameInstance, username, card) {
    const nextPlayerUsername = Object.keys(gameInstance.players)[gameInstance.nextPlayerIndex];

    if (nextPlayerUsername !== username) {
        throw new Error(`Vez de ${nextPlayerUsername} jogar uma carta`);
    };

    const playerCards = Object.keys(gameInstance.players[username].cards);

    if (!playerCards.includes(card)) {
        throw new Error(`Selecione uma carta válida`);
    };

    gameInstance.playedCards[username] = card;

    delete gameInstance.players[username].cards[card];

    gameInstance.nextPlayerIndex = (gameInstance.nextPlayerIndex % Object.keys(gameInstance.players).length) + 1;

    if (gameInstance.nextPlayerIndex === Object.keys(gameInstance.players).length) {
        gameInstance.nextPlayerIndex = 0;
    };

    if (Object.keys(gameInstance.playedCards).length === Object.keys(gameInstance.players).length) {
        const winners = determineWinner(gameInstance.playedCards);

        let responseMessage = '';
        let responseMessage2 = '';

        if (winners.length > 1) {
            responseMessage = {
                "status": "success",
                "message": `${winners[winners.length - 1]} foi o último a amarrar a mão`,
                "details": {
                    "winners": winners
                }
            };
        } else {
            responseMessage = {
                "status": "success",
                "message": `${winners[winners.length - 1]} ganhou a mão`,
                "details": {
                    "winners": winners
                }
            };

            gameInstance.players[winners[winners.length - 1]].handsWon += 1;

            if (gameInstance.players[winners[winners.length - 1]].handsWon > gameInstance.players[winners[winners.length - 1]].predictedHands && gameInstance.players[winners[winners.length - 1]].lives > 0) {
                gameInstance.players[winners[winners.length - 1]].lives -= 1;

                responseMessage2 = {
                    "status": "success",
                    "message": `${winners[winners.length - 1]} perdeu uma vida, agora tem ${gameInstance.players[winners[winners.length - 1]].lives}`,
                    "details": {
                        "username": winners[winners.length - 1],
                        "lives": gameInstance.players[winners[winners.length - 1]].lives
                    }
                };
            };
        };

        Object.keys(gameInstance.players).forEach(username => {
            const socketId = gameInstance.players[username].socketId;

            io.to(socketId).emit("handWinners", responseMessage);

            if (responseMessage2 !== '') {
                io.to(socketId).emit("livesLost", responseMessage2);
            };
        });

        gameInstance.playedCards = {};
        gameInstance.nextPlayerIndex = Object.keys(gameInstance.players).indexOf(winners[winners.length - 1]);
        gameInstance.hand += 1;

        let nextPlayerUsername = Object.keys(gameInstance.players)[gameInstance.nextPlayerIndex];

        if (gameInstance.hand > gameInstance.round) {
            gameInstance.round += 1;
            gameInstance.hand = 1;
            gameInstance.predictedHands = {};

            let responseMessage1 = '';

            Object.keys(gameInstance.players).forEach(username => {
                const predictedHands = gameInstance.players[username].predictedHands;
                const handsWon = gameInstance.players[username].handsWon;

                if (handsWon < predictedHands) {
                    const handsDifference = predictedHands - handsWon;

                    gameInstance.players[username].lives -= handsDifference;

                    responseMessage1 = {
                        "status": "success",
                        "message": `${username} perdeu uma vida, agora tem ${gameInstance.players[username].lives}`,
                        "details": {
                            "username": username,
                            "lives": gameInstance.players[username].lives
                        }
                    };

                    io.in(roomId).emit("livesLost", responseMessage1);
                };
            });

            Object.keys(gameInstance.players).forEach(username => {
                gameInstance.players[username].handsWon = 0;

                if (gameInstance.players[username].lives < 1) {
                    const responseMessage = {
                        "status": "success",
                        "message": `${username} foi eliminado`,
                        "details": {
                            "username": username,
                        }
                    };

                    io.in(roomId).emit("livesLost", responseMessage);

                    delete gameInstance.players[username];

                    if (gameInstance.nextPlayerIndex >= Object.keys(gameInstance.players).length) {
                        gameInstance.nextPlayerIndex = Object.keys(gameInstance.players).length - 1;
                        nextPlayerUsername = Object.keys(gameInstance.players)[gameInstance.nextPlayerIndex];
                    };
                };
            });

            distributeCards(gameInstance, gameInstance.round);

            Object.keys(gameInstance.players).forEach(username => {
                const socketId = gameInstance.players[username].socketId;
                const playerCards = gameInstance.players[username].cards;

                gameInstance.status = "awaiting predictions";

                const responseMessage = {
                    "status": "success",
                    "message": "Suas cartas foram distribuídas",
                    "details": {
                        "cards": playerCards
                    }
                };

                io.to(socketId).emit("receiveCards", responseMessage);

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
                            "game_status": gameInstance.status
                        }
                    }
                };

                io.to(socketId).emit("nextMove", nextMoveResponseMessage);

                if (Object.keys(gameInstance.players).length === 1) {
                    const responseMessage = {
                        "status": "success",
                        "message": `${Object.keys(gameInstance.players)[0]} ganhou`,
                        "details": {
                            "username": username
                        }
                    };

                    io.in(roomId).emit("gameWinner", responseMessage);
                };
            });
        };
    };
};

function determineWinner(playedCards) {
    let highestCardValue = -1;
    let winners = [];

    Object.keys(playedCards).forEach(username => {
        const cardName = playedCards[username];
        const cardObject = cardWithValues.find(card => card[cardName]);
        const cardValue = cardObject[cardName].value;

        if (cardValue > highestCardValue) {
            highestCardValue = cardValue;
            winners = [username];
        } else if (cardValue === highestCardValue) {
            winners.push(username);
        };
    });

    return winners;
};