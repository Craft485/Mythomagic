const socket = io({transports: ['websocket'], upgrade: false})
// Attempt to join a game
window.onload = socket.emit("join-game")

const Game = {
    myHand: {},
    myCardsInPlay: {},
    opponentsHand: {}
}

function draw() {
    socket.emit('draw')
}

function play(cardName) {
    // This function isn't meant to deal with UI, we deal with UI
    // when we get a response from the server.
    // This is going to cause problems in the future.
    const card = Game.myHand[cardName]
    if (card) {
        Game.myCardsInPlay[cardName] = card
        delete Game.myHand[cardName]
        socket.emit('play', [cardName])
    }
}

function action(myCard, opCard) {
    const card = Game.myCardsInPlay[myCard]
    const _opCard = Game.opponentsHand[opCard]
    if (card.props?.attack && _opCard.props?.health) {
        // Server will deal with the actual action
        socket.emit('attack', [card, _opCard])
    }
}

// Socket event listeners
socket.on('confirm', msg => console.info(msg))

socket.on('err', errmsg => console.error(`Err: ${errmsg}`))

socket.on('turn-ended', () => console.log('Turn ended, it is now your turn'))

socket.on('no-play', (msg) => {
    console.error(msg)
})

socket.on('new-card', card => {
    console.log(card)

    if (card) Game.myHand[card.name] = card
    /** @todo: add UI things */
})

socket.on('op-play', card => {
    Game.opponentsHand[card.name] = card
    console.log("Opponent played card")
})

socket.on('attack-res', res => console.log(res))