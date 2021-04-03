class Game {
    Players: Array<Player>
    constructor() {
        this.Players = []
    }
    join(id: string): string | void {
        if (this.Players.length < 3) {
            const f = this.Players.length === 0 ? true : false
            const p = new Player({ id: id, deck: _tDeck, isTakingTurn: f })
            this.Players.push(p)
        }
    }
    /** @todo: make an actual player id, not the socket id */
    drawCard(playerID: string): Card | Error {
        // Get the player
        const player: Player = this.Players.find(player => player.props.id === playerID)
        // Draw a card, make sure we actually can draw a card
        if (player.isTakingTurn && this.Players.length === 2) {
            const card: Card = player.props.deck.draw()
            console.log('card:')
            if (!card) console.error('Could not draw card')
            console.log(card)
            this.Players[0].isTakingTurn = this.Players[0].isTakingTurn ? false : true
            this.Players[1].isTakingTurn = this.Players[1].isTakingTurn ? false : true
            return card
        }
        // If it isn't the players turn we are sending null, which can be dealt with client side
        // And there will probaly be a check client side for if drawing is allowed so this case might end up not happening
    }
}

module.exports.Game = Game