const socket = io({transports: ['websocket'], upgrade: false})
// Attempt to join a game
window.onload = socket.emit("join-game")

const Game = {
    myHand: {},
    myCardsInPlay: {},
    opponentsHand: {},
    isMyTurn: false,
    opponentsHealth: 500,
    myHealth: 500
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
    const _opCard = opCard.toLowerCase() === 'player' ? {a: 'player', health: Game.opponentsHealth} : Game.opponentsHand[opCard]
    if (card.props?.attack) {
        // Server will deal with the actual action
        socket.emit('attack', [card, _opCard])
    }
}

function endTurn() {
    socket.emit('turn-end')
    Game.isMyTurn = false
}

// Socket event listeners
socket.on('confirm', (msg, s) => {console.info(`${msg}`); Game.isMyTurn = s || false;})

socket.on('err', errmsg => console.error(`Err: ${errmsg}`))

socket.on('turn-ended', () => {
    console.log('Turn ended, it is now your turn')
    Game.isMyTurn = true
})

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

socket.on('attack-res', res => {
    console.log(res)
    // Update game state
    if (Game.isMyTurn) {
        Game.myCardsInPlay[res[0].name] = res[0]
        res[1].props.defense ? Game.opponentsHand[res[1].name] = res[1] : Game.opponentsHealth = res[1].props.health
    } else if (!Game.isMyTurn) {
        Game.opponentsHand[res[0].name] = res[0]
        res[1].props.defense ? Game.myCardsInPlay[res[1].name] = res[1] : Game.myHealth = res[1].props.health
    }
    /** @todo: add updates to UI, also, add a UI */
    /** @todo: add event to deal with card deaths */
})

socket.on('game-over', info => {
    console.log(`Winner: ${info.w.props.id}\nLoser: ${info.l.props.id}`)
})