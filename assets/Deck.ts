function shuffle(array: Array<any>) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

interface _DeckProps {
    deckMap: Map<number, Card>
}

class Deck {
    props: _DeckProps
    cards: Array<any>
    constructor(props: _DeckProps) {
        this.props = props
        this.cards = (function(props: _DeckProps): Array<Card> {
            let arr: Array<Card> = []
            // Is this a bad way to acheive this? Probably.
            // Does it seem to work without chucking errors at the speed of light? Yes.
            props.deckMap.forEach((card: Card, count: number) => {
                while (count > 0) {
                    count--
                    arr.push(card)
                }
            })
            return arr
        }(this.props))
        // (function ():number {
        //     let l = 0
        //     props.deckMap.forEach((card: Card, num: number) => l += num)
        //     return l
        // }())
    }
    draw(): Card {
        // Get a random card from the array, return its instance and then remove it
        const i = Math.floor(Math.random() * this.cards.length)
        console.log(`index for draw card: ${i}`)
        const card = this.cards[i]
        this.cards.splice(i, 1)
        console.log("cards:");
        console.log(this.cards)
        return card
    }
}
// Testing/Sample deck
const m = new Map
cardList.forEach(card => m.set(2, card))
const _tDeck: Deck = new Deck({ deckMap: m })

module.exports.Deck = Deck
module.exports.shuffle = shuffle
module.exports._tDeck = _tDeck