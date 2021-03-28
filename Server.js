const express = require('express')
const app = express()
const http = require('http').createServer(app)
const conf = require('./conf.json')
const fs = require('fs')
const io = require('socket.io')(http)
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

io.on("connection", socket => {
    console.log(`Connection Received: ${socket.id}`.underline)

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