interface CardProps {
    name: string
    description: string
    imageURL: string
    attack?: number
    health?: number
    defense?: number
    isMajorOlympian?: boolean
    isUndead?: boolean
    isInPlay?: boolean
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
}

/**
 * ===RULES FOR CARDS===
 * All primordial beigns ignore defense values
 * All primordials raise their own defense stat when attacking
 * Hestia can heal other major olympians on her team for half of her current health(rounded down)
 */

const CHAOS = new Card({ name: 'Chaos', description: 'The primordial god of everything, all that is owes its existence to Chaos', imageURL: './placeholdercard.png', health: 200, attack: 100, defense: 50 })
CHAOS.action = function (attackingCard: Card, defendingCard: Card | Player): Array<Card | Object> {
    // You cannot defend yourself from primordial beings
    // So we ignore defense
    defendingCard.props.health -= attackingCard.props.attack
    attackingCard.props.defense += 10
    // Card death is dealt with client side
    return [attackingCard, defendingCard]
}

const ZEUS = new Card({ name: 'Zeus', description: 'King of the olympian gods, son of Kronos, a powerful sky deity', attack: 70, health: 150, defense: 25, imageURL: './placeholdercard.png', isMajorOlympian: true })
ZEUS.action = function (attackingCard: Card, defendingCard: Card | Player): Array<Card | Object> {
    defendingCard.props.health -= attackingCard.props.attack
    if (attackingCard.props.defense < this.props.defense) attackingCard.props.defense = this.props.defense
    return [attackingCard, defendingCard]
}
// Hera should have an ability, but I don't know what yet
const HERA = new Card({ name: 'Hera', description: 'Queen of the olympian gods, daughter of Kronos, goddess of marriage, and wife to Zeus', attack: 70, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true })
HERA.action = function (attackingCard: Card, defendingCard: Card | Player): Array<Card | Object> {
    defendingCard.props.health -= attackingCard.props.attack
    return [attackingCard, defendingCard]
}
// Hestia can heal other major olympians on her team for half of her current health(rounded down)
const HESTIA = new Card({ name: 'Hestia', description: '', attack: 50, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true })
HESTIA.action = function (attackingCard: Card, defendingCard: Card | Player, attacker: Player, defender: Player): Array<Card | Object> {
    defendingCard.props.health -= attackingCard.props.attack
    // This is a problem waiting to happen
    attacker.props.deck.cards.forEach((card: Card) => { if (card.props.isMajorOlympian && card.name !== this.name && card.props.isInPlay) card.props.health += Math.floor(attackingCard.props.health / 2) })
    return [attackingCard, defendingCard, attacker, defender]
}
// Undead cards currently in play will get a boost to their attack value
const HADES = new Card({ name: 'Hades', description: '', attack: 70, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true })
HADES.action = function (attackingCard: Card, defendingCard: Card | Player, attacker: Player, defender: Player): Array<Card | Object> {
    defendingCard.props.health -= attackingCard.props.attack
    attacker.props.deck.cards.forEach((card: Card) => { if (card.props.isUndead && card.name !== this.name && card.props.isInPlay) card.props.attack += 10 })
    return [attackingCard, defendingCard, attacker, defender]
}
/** @todo: ADD DESCRIPTIONS */
const POSEIDON = new Card({ name: 'Poseidon', description: '', attack: 70, health: 150, defense: 25, imageURL: './placeholder.png', isMajorOlympian: true })
POSEIDON.action = function (attackingCard: Card, defendingCard: Card | Player, attacker: Player, defender: Player): Array<Card | Object> {
    defendingCard.props.health -= attackingCard.props.attack
    return [attackingCard, defendingCard, attacker, defender]
}

const cardList: Card[] = [CHAOS, ZEUS, HERA, HESTIA, HADES, POSEIDON]

module.exports.Card = Card
module.exports.cardList = cardList