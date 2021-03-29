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
    die() {
    }
}
const CHAOS = new Card({ name: 'Chaos', description: 'The primordial god of everything, all that is owes it\'s existence to Chaos', imageURL: './placeholdercard.png', health: 200, attack: 100, defense: 50 });
CHAOS.action = function (defendingCard) {
    if (!defendingCard.props.health)
        return;
    defendingCard.props.health -= this.props.attack;
    if (defendingCard.props.health <= 0)
        defendingCard.die();
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
            const p = new Player({ id: id, deck: _tDeck });
            this.Players.push(p);
        }
        console.log(this.Players);
        console.log(this.Players[0]);
    }
    drawCard(playerID) {
        const player = this.Players.find(player => player.props.id === playerID);
        console.log('player');
        console.log(player);
        const card = player.props.deck.draw();
        console.log('card:');
        if (!card)
            console.error('Could not draw card');
        console.log(card);
        return card;
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
            props.deckMap.forEach((card, count) => {
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
        console.log(`index for draw card: ${i}`);
        const card = this.cards[i];
        this.cards.splice(i, 1);
        console.log("cards:");
        console.log(this.cards);
        return card;
    }
}
const m = new Map;
cardList.forEach(card => m.set(2, card));
const _tDeck = new Deck({ deckMap: m });
module.exports.Deck = Deck;
module.exports.shuffle = shuffle;
module.exports._tDeck = _tDeck;
class Player {
    constructor(props) {
        this.props = props;
        this.isTakingTurn;
    }
}
module.exports.Player = Player;
