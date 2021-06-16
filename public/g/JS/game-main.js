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

function generateHTML(card, count) {
    const parent = document.createElement('div')
    parent.className = `card ${count ? card.name + count + ' ' + card.name : card.name}`
    // We don't use ids because of the scenario of a Poseidon being played by each player for example, it can't be unique
    // parent.id = count ? card.name + count : card.name
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
    if (document.getElementById('myHand').children.length < 7) socket.emit('draw')
}

function play(cardNameWithCount) {
    console.log("Play card event")
    // Update client game state and ui as well as send update to server
    const card = Game.myHand[cardNameWithCount]
    // console.log(card)
    // There are two different counts at play here, my brain doesn't enjoy this
    const cardName = cardNameWithCount.split('_')[0]
    if (card) {
        let count = 1
        !function recurse() {
            if (!Game.myCardsInPlay[`${cardName}_${count}`]) {
                Game.myCardsInPlay[`${cardName}_${count}`] = card
            } else {
                count++
                return recurse()
            }
        }()
        Game.myCardsInPlay[cardName + `_${count}`] = card
        // console.log(count)
        // console.log(Game.myCardsInPlay[cardName + `_${count}`])
        delete Game.myHand[cardNameWithCount]
        // Server doesn't care what count is
        socket.emit('play', [cardName])
        // Update UI
        _myField.appendChild(generateHTML(card, `_${count}`))
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

// This variable is apart of a very dumb fix to a very dumb problem
// The variable, and the associated code, is in place to
// start the game, without this logic, the server dies.
// This variable is set to true if we haven't yet generated the starting hand
let z = true

// Socket event listeners
socket.on('confirm', (msg, s) => { 
    console.info(`${msg}`)
    Game.isMyTurn = s || false
    document.getElementById('myHD').parentElement.children[0].style.stroke = Game.isMyTurn ? 'blue' : 'red'
    document.getElementById('opHD').parentElement.children[0].style.stroke = Game.isMyTurn ? 'red' : 'blue'
})

socket.on('err', errmsg => console.error(`Err: ${errmsg}`))

socket.on('game-begin', () => {
    // Gen initial hand
    if (Game.isMyTurn) {
        for (let i=0;i<7;i++) socket.emit('draw', [{ isGenStartUp: true }])
        endTurn()
        z = false
    }
    for (let i=0;i<7;i++) _opHand.appendChild(baseCardWithBG())
})

socket.on('turn-ended', () => {
    console.log('Turn ended, it is now your turn')
    Game.isMyTurn = true
    if (z) {
        for (let i=0;i<7;i++) socket.emit('draw', [{ isGenStartUp: true }])
        endTurn()
    }
})

socket.on('no-play', (msg) => {
    console.error(msg)
})

socket.on('new-card', card => {
    console.log(card)
    if (card) {
        // Client Side Game State
        let count = 1
        // Concise documentation is an unrealistic expectation :)
        !function recurse() {
            if (!Game.myHand[`${card.name}_${count}`]) {
                Game.myHand[`${card.name}_${count}`] = card
            } else {
                count++
                return recurse()
            }
        }()
        // UI
        const e = generateHTML(card, `_${count}`)
        e.onclick = () => { play(card.name + `_${count}`); e.remove() }
        _myHand.appendChild(e)
    }
})

socket.on('op-new-card', () => {
    _opHand.appendChild(baseCardWithBG())
})

socket.on('op-play', card => {
    console.log("Opponent played card")
    // Update game state
    let count = 1
    !function recurse() {
        if (!Game.opponentsHand[`${card.name}_${count}`]) {
            Game.opponentsHand[`${card.name}_${count}`] = card
        } else {
            count++
            return recurse()
        }
    }()
    // Update UI
    _opHand.children[0].remove()
    _opField.appendChild(generateHTML(card, `_${count}`))
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

// window.addEventListener('keydown', e => { if (!e.metaKey) e.preventDefault() })