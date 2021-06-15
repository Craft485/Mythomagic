class Card {
    constructor(props) {
        this.name = props.name;
        this.description = props.description;
        this.imgURL = props.imageURL;
        this.props = props;
    }
}
const CHAOS = new Card({ name: 'Chaos', description: 'The primordial god of everything, all that is owes its existence to Chaos', imageURL: './placeholdercard.png', health: 200, attack: 100, defense: 50 });
CHAOS.action = function (attackingCard, defendingCard) {
    defendingCard.props.health -= attackingCard.props.attack;
    attackingCard.props.defense += 10;
    return [attackingCard, defendingCard];
};
const ZEUS = new Card({ name: 'Zeus', description: 'King of the olympian gods, son of Kronos, a powerful sky deity', attack: 70, health: 150, defense: 25, imageURL: './placeholdercard.png', isMajorOlympian: true });
ZEUS.action = function (attackingCard, defendingCard) {
    defendingCard.props.health -= attackingCard.props.attack;
    if (attackingCard.props.defense < this.props.defense)
        attackingCard.props.defense = this.props.defense;
    return [attackingCard, defendingCard];
};
const HERA = new Card({ name: 'Hera', description: 'Queen of the olympian gods, daughter of Kronos, goddess of marriage, and wife to Zeus', attack: 70, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true });
HERA.action = function (attackingCard, defendingCard) {
    defendingCard.props.health -= attackingCard.props.attack;
    return [attackingCard, defendingCard];
};
const HESTIA = new Card({ name: 'Hestia', description: '', attack: 50, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true });
HESTIA.action = function (attackingCard, defendingCard, attacker, defender) {
    defendingCard.props.health -= attackingCard.props.attack;
    attacker.props.deck.cards.forEach((card) => { if (card.props.isMajorOlympian && card.name !== this.name && card.props.isInPlay)
        card.props.health += Math.floor(attackingCard.props.health / 2); });
    return [attackingCard, defendingCard, attacker, defender];
};
const HADES = new Card({ name: 'Hades', description: '', attack: 70, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true });
HADES.action = function (attackingCard, defendingCard, attacker, defender) {
    defendingCard.props.health -= attackingCard.props.attack;
    attacker.props.deck.cards.forEach((card) => { if (card.props.isUndead && card.name !== this.name && card.props.isInPlay)
        card.props.attack += 10; });
    return [attackingCard, defendingCard, attacker, defender];
};
const POSEIDON = new Card({ name: 'Poseidon', description: '', attack: 70, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true });
POSEIDON.action = function (attackingCard, defendingCard, attacker, defender) {
    defendingCard.props.health -= attackingCard.props.attack;
    return [attackingCard, defendingCard, attacker, defender];
};
const cardList = [CHAOS, ZEUS, HERA, HESTIA, HADES, POSEIDON];
module.exports.Card = Card;
module.exports.cardList = cardList;
class Game {
    constructor() {
        this.Players = [];
    }
    join(id) {
        if (this.Players.length < 3) {
            const f = this.Players.length === 0 ? true : false;
            const p = new Player({ id: id, deck: f ? _tDeck1 : _tDeck2, isTakingTurn: f, health: 500 });
            this.Players.push(p);
        }
    }
    drawCard(playerID) {
        const player = this.Players.find(player => player.props.id === playerID);
        if (this.Players.length === 2) {
            const card = player.props.deck.draw();
            if (!card)
                console.error('Could not draw card');
            return card;
        }
    }
    endTurn() {
        this.Players[0].isTakingTurn = this.Players[0].isTakingTurn ? false : true;
        this.Players[1].isTakingTurn = this.Players[1].isTakingTurn ? false : true;
    }
    isGameOver() {
        const P1 = this.Players[0];
        const P2 = this.Players[1];
        if (P1.props.health <= 0 || P2.props.health <= 0) {
            const r = { w: P1.props.health > 0 ? P1 : P2, l: P1.props.health <= 0 ? P1 : P2 };
            return r;
        }
        else
            return false;
    }
}
module.exports.Game = Game;
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
class Deck {
    constructor(props) {
        this.props = props;
        this.cards = (function (props) {
            let arr = [];
            props.deckMap.forEach(a => {
                const card = a[0];
                let count = a[1];
                while (count > 0) {
                    count--;
                    arr.push(card);
                }
            });
            return arr;
        }(this.props));
    }
    draw() {
        const i = Math.floor(Math.random() * this.cards.length);
        const card = this.cards[i];
        this.cards.splice(i, 1);
        return card;
    }
}
const m = new Map;
cardList.forEach(card => m.set(card.name, [card, 2]));
const _tDeck = new Deck({ deckMap: m });
const _tDeck1 = new Deck({ deckMap: m });
const _tDeck2 = new Deck({ deckMap: m });
module.exports.Deck = Deck;
module.exports.shuffle = shuffle;
module.exports._tDeck = _tDeck;
class Player {
    constructor(props) {
        this.props = props;
        this.isTakingTurn = props.isTakingTurn || false;
        this.health = props.health;
    }
}
module.exports.Player = Player;
