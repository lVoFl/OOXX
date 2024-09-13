const io = require('socket.io-client');

const socket = io('http://localhost:3001');

function joinRoom(roomID, password, name) {
    let data = { roomID, password, name }
    socket.emit('joinRoom', data, (callback) => {
        console.log(callback)
    })
    socket.emit("getRoomInfo", data)
    // socket.emit('startGame', roomID)

    socket.on('Game_start', (data) => {
        console.log(data)
    })
    socket.on("getRoomInfo", (data) => {
        console.log(data)
    })

    socket.on("userJoined", (data) => {
        console.log("size "+data)
    })
}

joinRoom('123', '123', 'vOf');
