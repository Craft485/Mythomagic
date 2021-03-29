const socket = io({transports: ['websocket'], upgrade: false})
// Attempt to join a game
window.onload = socket.emit("join-game")

function draw() {
    socket.emit('draw')
}

// Socket event listeners
socket.on('confirm', msg => console.info(msg))

socket.on('err', errmsg => console.error(`Err: ${errmsg}`))
// Logging will work for now, later need to update UI stuff
socket.on('new-card', card => console.log(card))