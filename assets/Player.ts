interface _PlayerProps {
    deck: Deck
    id: string | number
}

class Player {
    props: _PlayerProps
    isTakingTurn: boolean
    constructor(props: _PlayerProps) {
        // THIS IS NEEDED, ITS USED TO ACCESS THE PLAYER DECK
        // THIS CLASS ISN'T AS USELESS AS IT LOOKS
        this.props = props
        this.isTakingTurn
    }
}

module.exports.Player = Player