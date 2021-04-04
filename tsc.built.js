class Card {
    constructor(props) {
        this.name = props.name;
        this.description = props.description;
        this.imgURL = props.imageURL;
        this.props = props;
    }
    getHTML() {
        const card = document.createElement('div');
        card.style.backgroundImage = this.imgURL;
        card.className = "card";
        const h = document.createElement('h3');
        h.className = "card-heading";
        return card;
    }
}
const CHAOS = new Card({ name: 'Chaos', description: 'The primordial god of everything, all that is owes its existence to Chaos', imageURL: './placeholdercard.png', health: 200, attack: 100, defense: 50 });
CHAOS.action = function (attackingCard, defendingCard) {
    defendingCard.props.health -= attackingCard.props.attack;
    attackingCard.props.defense += 10;
    return [attackingCard, defendingCard];
};
const ZEUS = new Card({ name: 'Zeus', description: 'King of the olympian gods, son of Kronos, a powerful sky deity', attack: 70, health: 150, defense: 25, imageURL: './placeholdercard.png' });
ZEUS.action = function (defendingCard) {
};
const cardList = [CHAOS, ZEUS];
module.exports.Card = Card;
module.exports.cardList = cardList;
class Game {
    constructor() {
        this.Players = [];
    }
    join(id) {
        if (this.Players.length < 3) {
            const f = this.Players.length === 0 ? true : false;
            const p = new Player({ id: id, deck: _tDeck, isTakingTurn: f });
            this.Players.push(p);
        }
    }
    drawCard(playerID) {
        const player = this.Players.find(player => player.props.id === playerID);
        if (player.isTakingTurn && this.Players.length === 2) {
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
module.exports.Deck = Deck;
module.exports.shuffle = shuffle;
module.exports._tDeck = _tDeck;
class Player {
    constructor(props) {
        this.props = props;
        this.isTakingTurn = props.isTakingTurn || false;
    }
}
module.exports.Player = Player;
