interface _PlayerProps {
    deck: Deck
    id: string | number
    health: number
    isTakingTurn?: boolean
}

class Player {
    props: _PlayerProps
    isTakingTurn: boolean
    health: number
    constructor(props: _PlayerProps) {
        // THIS IS NEEDED, ITS USED TO ACCESS THE PLAYER DECK
        // THIS CLASS ISN'T AS USELESS AS IT LOOKS
        this.props = props
        this.isTakingTurn = props.isTakingTurn || false
        this.health = props.health
    }
}

module.exports.Player = Player