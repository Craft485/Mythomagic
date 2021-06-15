class Game {
    Players: Array<Player>
    constructor() {
        this.Players = []
    }
    join(id: string): string | void {
        if (this.Players.length < 3) {
            const f = this.Players.length === 0 ? true : false
            // Multiple test decks are needed because Objects are reference types, meaning 2 games at the same time won't work currently.
            // This should be fixed once I do db stuff
            const p = new Player({ id: id, deck: f ? _tDeck1: _tDeck2, isTakingTurn: f, health: 500 })
            this.Players.push(p)
        }
    }
    /** @todo: make an actual player id, not the socket id */
    drawCard(playerID: string): Card | Error {
        // Get the player
        const player: Player = this.Players.find(player => player.props.id === playerID)
        // Draw a card, make sure we actually can draw a card
        if (/*player.isTakingTurn &&*/ this.Players.length === 2) {
            const card: Card = player.props.deck.draw()
            if (!card) console.error('Could not draw card')
            return card
        }
        // If it isn't the players turn we are sending null, which can be dealt with client side
        // And there will probaly be a check client side for if drawing is allowed so this case might end up not happening
    }
    endTurn() {
        // Simply update game state
        this.Players[0].isTakingTurn = this.Players[0].isTakingTurn ? false : true
        this.Players[1].isTakingTurn = this.Players[1].isTakingTurn ? false : true
    }
    isGameOver(): Object | Boolean {
        const P1 = this.Players[0]
        const P2 = this.Players[1]
        if (P1.props.health <= 0 || P2.props.health <= 0) {
            const r = { w: P1.props.health > 0 ? P1 : P2, l: P1.props.health <= 0 ? P1 : P2 }
            return r
        } else return false
    }
}

module.exports.Game = Game