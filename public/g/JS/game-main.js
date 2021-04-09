/** @todo: add updates to UI, also, add a UI */
/** @todo: add event to deal with card deaths */
const socket = io({transports: ['websocket'], upgrade: false})

const Game = {
    myHand: {},
    myCardsInPlay: {},
    opponentsHand: {},
    isMyTurn: false,
    opponentsHealth: 500,
    myHealth: 500,
    actionCount: 2
}

function generateHTML(card) {
    const parent = document.createElement('div')
    parent.className = `card ${card.name}`
    // parent.style.backgroundImage = card.props.imageURL

    const title = document.createElement('h3')
    title.innerHTML = `<b>${card.name}</b>`

    const stats = document.createElement('div')
    stats.innerHTML = `<span class="dfns">${card.props?.defense || 0}</span> / <span class="hlth">${card.props?.health || 0}</span> / <span class="ttck">${card.props?.attack || 0}</span>`

    parent.appendChild(title)
    parent.appendChild(document.createElement('br'))
    parent.appendChild(stats)

    return parent
}

function addOpponentsCardToPlay(newCard) {
    // Remove card from hand, doesn't matter which one
    _opHand.children[0].remove()
    // Create html element based off of card info and append new card
    const card = generateHTML(newCard)
    _opField.appendChild(card)
}

const _opHand  = document.getElementById('opHand')
const _opField = document.getElementById('opInPlay')
const _myField = document.getElementById('myCardsInPlay')
const _myHand  = document.getElementById('myHand')

const baseCardWithBG = function() {
    let _ = document.createElement('div')
    _.style.backgroundImage = `url(${window.location.href.includes('users') ? '../images/logo.png' : '/g/images/logo.png'})`
    _.className = 'card card-b'
    return _
}

function draw() {
    socket.emit('draw')
}

function play(cardName) {
    // Update client game state and ui as well as send update to server
    const card = Game.myHand[cardName]
    if (card) {
        Game.myCardsInPlay[cardName] = card
        delete Game.myHand[cardName]
        socket.emit('play', [cardName])
        _myField.appendChild(generateHTML(card))
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
socket.on('confirm', (msg, s) => { 
    console.info(`${msg}`)
    Game.isMyTurn = s || false
    document.getElementById('myHD').parentElement.children[0].style.stroke = Game.isMyTurn ? 'blue' : 'red'
    document.getElementById('opHD').parentElement.children[0].style.stroke = Game.isMyTurn ? 'red' : 'blue'
})

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
    _myHand.appendChild(generateHTML(card))
})

socket.on('op-new-card', () => {
    _opHand.appendChild(baseCardWithBG())
})

socket.on('op-play', card => {
    Game.opponentsHand[card.name] = card
    console.log("Opponent played card")
    _opHand.children[0].remove()
    _opField.appendChild(generateHTML(card))
})

socket.on('attack-res', res => {
    console.log(res)
    // Update game state
    if (Game.isMyTurn && res) {
        Game.myCardsInPlay[res[0].name] = res[0]
        res[1].props.defense ? Game.opponentsHand[res[1].name] = res[1] : Game.opponentsHealth = res[1].props.health
        // This code block is repeated even though it doesn't need to be, fix later
        const c = document.getElementsByClassName('card')
        for (let i = 0; i < c.length; i++) {
            // Same as c.item(i)
            const a = c[i]
            const p = a.parentElement
            if (p?.id === 'myCardsInPlay') a.replaceWith(generateHTML(res[0]))
        }

        if (!res[1].props?.description) document.getElementById('opHD').innerHTML = res[1].props.health
    } else if (!Game.isMyTurn && res) {
        Game.opponentsHand[res[0].name] = res[0]
        res[1].props.defense ? Game.myCardsInPlay[res[1].name] = res[1] : Game.myHealth = res[1].props.health

        const c = document.getElementsByClassName('card')
        for (let i = 0; i < c.length; i++) {
            // Same as c.item(i)
            const a = c[i]
            const p = a.parentElement
            if (p?.id === 'opInPlay') a.replaceWith(generateHTML(res[0]))
        }

        if (!res[1].props?.description) document.getElementById('myHD').innerHTML = res[1].props.health
    }
})

socket.on('game-over', info => {
    console.log(`Winner: ${info.w.props.id}\nLoser: ${info.l.props.id}`)
})

// Attempt to join a game
window.onload = socket.emit("join-game")

window.addEventListener('keydown', e => { if (e.key === 'Escape') aFunctionThatIsNotHere?.() })