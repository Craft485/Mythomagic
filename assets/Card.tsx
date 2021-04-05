interface CardProps {
    name: string
    description: string
    imageURL: string
    attack?: number
    health?: number
    defense?: number
    [key: string]: any
}

class Card {
    name: string
    description: string
    imgURL: string
    action: any
    props: CardProps
    constructor (props: CardProps) {
        this.name = props.name
        this.description = props.description
        this.imgURL = props.imageURL
        this.props = props
    }
    getHTML(): HTMLDivElement {
        const card = document.createElement('div')
        card.style.backgroundImage = this.imgURL
        card.className = "card"

        const h = document.createElement('h3')
        h.className = "card-heading"

        return card
    }
}

const CHAOS = new Card({ name: 'Chaos', description: 'The primordial god of everything, all that is owes its existence to Chaos', imageURL: './placeholdercard.png', health: 200, attack: 100, defense: 50 })
CHAOS.action = function (attackingCard: Card, defendingCard: Card | any): Array<Card | Object> {
    // You cannot defend yourself from primordial beings
    // So we ignore defense
    // defendingCard.props ? defendingCard.props.health -= attackingCard.props.attack : defendingCard.health-= attackingCard.props.attack
    defendingCard.props.health -= attackingCard.props.attack
    attackingCard.props.defense += 10
    // Card death is dealt with client side
    return [attackingCard, defendingCard]
}

const ZEUS = new Card({ name: 'Zeus', description: 'King of the olympian gods, son of Kronos, a powerful sky deity', attack: 70, health: 150, defense: 25, imageURL: './placeholdercard.png' })
ZEUS.action = function (defendingCard: Card) {

}

const cardList: Card[] = [CHAOS, ZEUS]

module.exports.Card = Card
module.exports.cardList = cardList