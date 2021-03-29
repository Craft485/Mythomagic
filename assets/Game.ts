class Game {
    Players: Array<Player>
    constructor() {
        this.Players = []
    }
    join(id: string): string | void {
        if (this.Players.length < 3) {
            const p = new Player({ id: id, deck: _tDeck })
            this.Players.push(p)
        }
        console.log(this.Players)
        console.log(this.Players[0])
    }

    drawCard(playerID: string): Card | Error {
        // Get the player
        const player: Player = this.Players.find(player => player.props.id === playerID)
        console.log('player')
        console.log(player)
        // Draw a card, catch any errors
        const card: Card = player.props.deck.draw()
        console.log('card:')
        if (!card) console.error('Could not draw card')
        console.log(card)
        return card // ? card : new Error('An error occured')
    }
}

module.exports.Game = Game