export const cardWithValues = [
    { '4♦️': { 'value': 1 } },
    { '4♠️': { 'value': 1 } },
    { '4♥️': { 'value': 1 } },
    { '5♦️': { 'value': 2 } },
    { '5♠️': { 'value': 2 } },
    { '5♥️': { 'value': 2 } },
    { '5♣️': { 'value': 2 } },
    { '6♦️': { 'value': 3 } },
    { '6♠️': { 'value': 3 } },
    { '6♥️': { 'value': 3 } },
    { '6♣️': { 'value': 3 } },
    { '7♠️': { 'value': 4 } },
    { '7♣️': { 'value': 4 } },
    { 'Q♦️': { 'value': 5 } },
    { 'Q♠️': { 'value': 5 } },
    { 'Q♥️': { 'value': 5 } },
    { 'Q♣️': { 'value': 5 } },
    { 'J♦️': { 'value': 6 } },
    { 'J♦️': { 'value': 6 } },
    { 'J♠️': { 'value': 6 } },
    { 'J♥️': { 'value': 6 } },
    { 'K♣️': { 'value': 7 } },
    { 'K♦️': { 'value': 7 } },
    { 'K♠️': { 'value': 7 } },
    { 'K♥️': { 'value': 7 } },
    { 'A♦️': { 'value': 8 } },
    { 'A♥️': { 'value': 8 } },
    { 'A♣️': { 'value': 8 } },
    { '2♦️': { 'value': 9 } },
    { '2♠️': { 'value': 9 } },
    { '2♥️': { 'value': 9 } },
    { '2♣️': { 'value': 9 } },
    { '3♦️': { 'value': 10 } },
    { '3♠️': { 'value': 10 } },
    { '3♥️': { 'value': 10 } },
    { '3♣️': { 'value': 10 } },
    { '7♦️': { 'value': 11 } },
    { 'A♠️': { 'value': 12 } },
    { '7♥️': { 'value': 13 } },
    { '4♣️': { 'value': 14 } }
];

export function shuffleDeck() {
    var newDeck = [...cardWithValues];
    newDeck.sort(() => Math.random() - 0.5);
    return newDeck;
};