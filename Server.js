const express = require('express')
const app = express()
const http = require('http').createServer(app)
const conf = require('./conf.json')
const fs = require('fs')
const io = require('socket.io')(http)
const { Card, cardList, Game, Player, _tDeck, shuffle, Deck } = require('./tsc.built')
require('colors')

app.use(express.static('./public'))

const files = []
const dirs = new Map

fs.readdir('./public', (err, readData) => {
    if (err) throw err

    const fileList = readData.filter(x => x.includes("."))
    const dirList = readData.filter(x => !x.includes("."))

    fileList.forEach(file => {
        files.push(file.split(".")[0])
        files.push(file)
    })
    // Read subdirs
    dirList.forEach(dir => {
        fs.readdir(`./public/${dir}`, (err, readData) => {
            if (err) throw err

            let subDirFileList = []
            readData.forEach(file => {
                subDirFileList.push(file.split(".")[0])
                subDirFileList.push(file)
                if (file.endsWith('html')) files.push(file.split(".")[0])
                files.push(file)
            })
            dirs.set(dir, subDirFileList)
        })
    })
})

const currentPlayers = {}
const games = []
let isCurrentGame = false

io.on("connection", socket => {
    console.log(`Connection Received: ${socket.id}`.underline)

    socket.on("join-game", args => {
        if (isCurrentGame) {
            // Using socket id for now, will change to some user id later
            // We will also need to query a db for getting deck data when thats a thing
            games[games.length - 1].join(socket.id)
            isCurrentGame = false
        } else {
            // Create a new game instance and join it
            const newGame = new Game()
            games.push(newGame)
            games[games.length -1].join(socket.id)
            isCurrentGame = true
        }
        Object.defineProperty(currentPlayers, socket.id, { value: games[games.length -1] })
        const firstTurn = currentPlayers[socket.id].Players[0].props.id === socket.id ? true : false
        socket.emit('confirm', 'Joined a lobby', firstTurn)
    })

    socket.on("draw", async (args) => {
        console.log("Draw call received")
        const g = currentPlayers[socket.id]
        const newCard = await g.drawCard(socket.id)
        if (typeof newCard === Error) {
            socket.emit('err', 'An error occured | ACTION: Draw Card')
        } else {
            socket.emit('new-card', newCard)
        }
    })

    socket.on("play", args => {
        const cName = args[0]
        const isValidCard = cardList.find(card => card.name.toLowerCase() === cName.toLowerCase())
        const g = currentPlayers[socket.id]
        // Find the player
        const player = g.Players.find(player => player.props.id === socket.id)
        if (isValidCard && g && player.isTakingTurn) {
            // Tell the other player that a card was played
            const p = g.Players.find(player => !player.isTakingTurn)
            io.sockets.sockets.get(p.props.id).emit('op-play', isValidCard)
        } else {
            socket.emit('no-play', 'Invalid card or other condition')
        }
    })

    socket.on('attack', async ([attackingCard, defendingCard]) => {
        // Get the game object and players
        const game = currentPlayers[socket.id]
        const attacker = game.Players.find(player => player.props.id === socket.id)
        const defender = game.Players.find(player => player.props.id !== socket.id)
        // Find the Object Literal of the attacking card, to use as a way to call the action method
        const card_a = cardList.find(card => card.name.toLowerCase() === attackingCard.name.toLowerCase())
        // Check that the socket/user is taking a turn, among other conditions
        if (attacker?.isTakingTurn && attackingCard.props.attack) {
            if (defendingCard?.props?.health || defendingCard?.health) {
                // Call the action method and return the result
                const defendingEntity = defendingCard?.a?.toLowerCase() === 'player' ? defender : defendingCard
                const res = await card_a.action(attackingCard, defendingEntity)
                // Send result back to client and opponent
                socket.emit('attack-res', res)
                io.sockets.sockets.get(defender.props.id).emit('attack-res', res)
                const gameOver = game.isGameOver()
                if (gameOver) {
                    socket.emit('game-over', gameOver)
                    io.sockets.sockets.get(defender.props.id).emit('game-over', gameOver)
                }
            } else {
                socket.emit('err', 'One of the conditions for action was not fulfilled')
            }
        }
    })

    socket.on('turn-end', () => {
        const g = currentPlayers[socket.id]
        g.endTurn()
        const defender = g.Players.find(player => player.props.id !== socket.id)
        io.sockets.sockets.get(defender.props.id).emit('turn-ended')
    })

    socket.on('disconnect', () => { console.log(`${socket.id} Disconnected`.underline) })
})

app.get(['/', /./], (req, res) => { 
    console.log(`GET Path: ${req.path}`.magenta)

    const endPoint = req.path.split('/').pop()

    if (files.includes(endPoint)) {
        const path = `./public${req.path.includes('.') ? req.path : `${req.path}.html`}`
        res.status(200).sendFile(path, { root: '.' })
    } else if (dirs.get(endPoint)) {
        res.status(200).sendFile(`./public${req.path}/index.html`, { root: '.' })
    } else if (['/', '/home', '/homepage'].includes(req.path)) {
        res.status(200).sendFile('./public/index.html', { root: '.' })
    } else {
        res.status(404).sendFile('./public/404.html', { root: '.' })
    }
})

setTimeout(() => {
    console.log(`Loaded file names: ${files.join(', ')}`.magenta);
    console.log(`Found Dir Count: ${dirs.size}`.magenta)
}, 1000)

http.listen(conf.port, console.log("SERVER ONLINE".magenta))