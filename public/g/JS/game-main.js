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
    actionCount: 2,
    attackingCard: null,
    defendingCard: null
}

function generateHTML(card, count) {
    const parent = document.createElement('div')
    // I'm aware this line makes little sense, but it works!
    parent.className = `card ${count ? card.name + count + ' ' + card.name : card.name}`
    // We don't use ids because of the scenario of a Poseidon being played by each player for example, it can't be unique
    // parent.id = count ? card.name + count : card.name
    // parent.style.backgroundImage = card.props.imageURL

    const title = document.createElement('h3')
    title.innerHTML = `<b>${card.name}</b>`

    const stats = document.createElement('div')
    stats.innerHTML = `<span class="dfns">${card.props?.defense || card.defense}</span> / <span class="hlth">${card.props?.health || card.health}</span> / <span class="ttck">${card.props?.attack || card.attack}</span>`

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

function attackPlayerDirectly() {
    // Give the card-select-for-action class to the enemy svg
    document.getElementsByName('svg')[0].classList.add('card-select-for-action')
    // Set defendingCard to "player"
    Game.defendingCard = 'player'
    // Reset the cards in _opFeild
    for (let i = 0; i < _opField.children.length; i++) {
        _opField.children[i].classList.remove('card-select-for-action')
    }
}

function play(cardNameWithCount) {
    console.log("Play card event")
    // Update client game state and ui as well as send update to server
    const card = Game.myHand[cardNameWithCount]
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
        delete Game.myHand[cardNameWithCount]
        // Server doesn't care what count is
        socket.emit('play', [cardName])
        // Update UI
        const newCard = generateHTML(card, `_${count}`)
        newCard.onclick = () => {
            Game.attackingCard = Game.myCardsInPlay[`${cardName}_${count}`]
            // There is a better way to do this yes, that isn't a question
            // Remove css class from all other cards in _myFeild
            for (let i = 0; i < _myField.children.length; i++) {
                _myField.children[i].classList.remove('card-select-for-action')
            }
            // Add css class to the newCard element
            newCard.classList.add('card-select-for-action')
        }
        _myField.appendChild(newCard)
    }
}
/** @deprecated */
function ACTION(myCard = Game.attackingCard, opCard = Game.defendingCard) {
    const card = Game.myCardsInPlay[myCard]
    const _opCard = opCard?.toLowerCase?.() === 'player' ? {a: 'player', health: Game.opponentsHealth} : Game.opponentsHand[opCard]
    if (card.props?.attack) {
        // Server will deal with the actual action
        socket.emit('attack', [myCard, _opCard])
    }
}

function action(attackingCard = Game.attackingCard, defendingCard = Game.defendingCard) {
    // Are we attacking the opponent player or card?
    const defendingEntity = defendingCard?.toLowerCase?.() === 'player' ? {a: 'player', health: Game.opponentsHealth} : defendingCard
    const attackingCardCount = document.querySelector(`#${_myField.id} > .card-select-for-action`).classList[1].split('_')[1]
    const defendingCardCount = document.querySelector(`#${_opField.id} > .card-select-for-action`).classList[1].split('_')[1]
    if (attackingCard.props?.attack && attackingCardCount && defendingCardCount) {
        // Server deals with game logic for attacking
        socket.emit('attack', [attackingCard, defendingEntity, attackingCardCount, defendingCardCount])
    }
}

function endTurn() {
    socket.emit('turn-end')
    Game.isMyTurn = false
    Game.attackingCard = null
    Game.defendingCard = null
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
        z = false
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
        // Concise documentation is an unrealistic expectation
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
    const newOpCard = generateHTML(card, `_${count}`)
    newOpCard.onclick = () => {
        Game.defendingCard = Game.opponentsHand[card.name + `_${count}`]
        for (let i = 0; i < _opField.children.length; i++) {
            _opField.children[i].classList.remove('card-select-for-action')
        }
        document.getElementsByTagName('svg')[0].classList.remove('card-select-for-action')
        newOpCard.classList.add('card-select-for-action')
    }
    _opField.appendChild(newOpCard)
})

socket.on('attack-res', (res, attackingCardCount, defendingCardCount) => {
    // res has 2 levels, the first level has a name property that contains the count, just like how we handle unqiue cards in class names
    // The second level is the card details/stats and is accessed via looking into props
    console.log(res)
    if (!res[0].name.includes('_')) res[0].name += `_${attackingCardCount}`
    if (!res[1].name.includes('_')) res[1].name += `_${defendingCardCount}`
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
            if (p?.id === _myField.id && a.classList.contains(res[0].name)) {
                const e = generateHTML(res[0].props, '_' + res[0].name.split('_')[1])
                // This onclick is from the play function, perhaps I shouldn't be copy pasting so much code
                e.onclick = () => {
                    Game.attackingCard = Game.myCardsInPlay[res[0].name]
                    for (let i = 0; i < _myField.children.length; i++) _myField.children[i].classList.remove('card-select-for-action')
                    e.classList.add('card-select-for-action')
                }
                a.replaceWith(e)
            } else if (p?.id === _opField.id && a.classList.contains(res[1].name)) {
                const e = generateHTML(res[1].props, '_' + res[1].name.split('_')[1])
                e.onclick = () => {
                    Game.defendingCard = Game.opponentsHand[res[1].name]
                    for (let i = 0; i < _opField.children.length; i++) _opField.children[i].classList.remove('card-select-for-action')
                    e.classList.add('card-select-for-action')
                }
                a.replaceWith(e)
            }
        }
        // If a player was attacked
        if (!res[1].props?.description) document.getElementById('opHD').innerHTML = res[1].props.health
    } else if (!Game.isMyTurn && res) {
        Game.opponentsHand[res[0].name] = res[0]
        res[1].props.defense ? Game.myCardsInPlay[res[1].name] = res[1] : Game.myHealth = res[1].props.health

        const c = document.getElementsByClassName('card')
        for (let i = 0; i < c.length; i++) {
            // Same as c.item(i)
            const a = c[i]
            const p = a.parentElement
            // Check and load for **attacking** card and then **defending** card
            if (p?.id === _opField.id && a.classList.contains(res[0].name)) {
                const e = generateHTML(res[0].props, '_' + res[0].name.split('_')[1])
                // This onclick is from the play function, perhaps I shouldn't be copy pasting so much code
                e.onclick = () => {
                    Game.defendingCard = Game.opponentsHand[res[0].name]
                    for (let i = 0; i < _opField.children.length; i++) _opField.children[i].classList.remove('card-select-for-action')
                    e.classList.add('card-select-for-action')
                }
                a.replaceWith(e)
            } else if (p?.id === _myField.id && a.classList.contains(res[1].name)) {
                const e = generateHTML(res[1].props, '_' + res[1].name.split('_')[1])
                e.onclick = () => {
                    Game.attackingCard = Game.myCardsInPlay[res[1].name]
                    for (let i = 0; i < _myField.children.length; i++) _myField.children[i].classList.remove('card-select-for-action')
                    e.classList.add('card-select-for-action')
                }
                a.replaceWith(e)
            }
        }

        if (!res[1].props?.description) document.getElementById('myHD').innerHTML = res[1].props.health
    }
})

socket.on('game-over', info => {
    // Create an overlay to block the player from interacting with the playing feild
    const overlay = document.createElement('div')
    overlay.id = 'game-end-overlay'
    overlay.innerText = `Winner:\n${info.w.props.id}\n\nLoser:\n${info.l.props.id}`
    document.body.appendChild(overlay)
    console.log(`Winner: ${info.w.props.id}\nLoser: ${info.l.props.id}`)
})

// Attempt to join a game
window.onload = socket.emit("join-game")

// window.addEventListener('keydown', e => { if (!e.metaKey) e.preventDefault() })