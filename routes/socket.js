'use strict';
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {cors: true});
const jwt = require("jsonwebtoken");
const mysql = require("mysql");

const hostname = '8.134.218.50'
const port = 3307
const pool = mysql.createPool({
    user: 'root',
    password: '123123',
    host: hostname,
    port: port,
    database: 'OOXX'
})

let passwords = {}
let rooms = {}


io.on('connection', socket => {
    console.log('A client connected:', socket.id);

    // 监听客户端请求加入房间的事件
    socket.on('joinRoom', (data, callback) => {
        try{
            const { roomID, password, name } = data;
            if(!passwords[roomID]){
                passwords[roomID] = password
            }else{
                if(passwords[roomID] !== password){
                    socket.emit("joinRoomResult", {success: false, message: "密码错误"})
                    return
                }
            }
            if(!rooms[roomID]){
                rooms[roomID] = []
                rooms[roomID].push({ name: name, socketId: socket.id })
            }else{
                rooms[roomID].push({ name: name, socketId: socket.id })
            }
            socket.emit("joinRoomResult", {success: true, message: "加入成功"})
            socket.join(roomID); // 将客户端加入指定的房间
            // console.log(`${name} joined room: ${roomID}`);
            const room = io.sockets.adapter.rooms.get(roomID);
            const size = room ? room.size : 0;
            console.log(size)
            // 通知房间内其他客户端，有新客户端加入
            socket.to(roomID).emit('userJoined', size);
        }catch (e) {
            console.log(e)
        }
    });

    socket.on('startGame', (roomID) => {
        // socket.emit('Game_start', roomID)
        if (!roomID) {
            console.log('Invalid roomID');
            return;
        }

        pool.query('SELECT level FROM GameData', (error, result) => {
            if (error) {
                console.error('Database query error:', error);
                io.to(roomID).emit('Game_start', { start: 0, error: 'Failed to start game' });
                return;
            }

            if (result.length === 0) {
                console.log('No levels found in GameData');
                io.to(roomID).emit('Game_start', { start: 0, error: 'No levels available' });
                return;
            }

            const n = result.length;
            const levelIndex = Math.floor(Math.random() * n);
            const level = result[levelIndex].level;

            io.to(roomID).emit('Game_start', { start: 1, level: level });
        });
    });

    socket.on('getRoomInfo', (roomID) => {
        roomID = roomID.roomID
        console.log(roomID)
        const room = io.sockets.adapter.rooms.get(roomID);
        const size = room ? room.size : 0;
        console.log(size)
        const response = rooms[roomID].map(item => item.name)
        console.log(response)
        io.emit('getRoomInfo', {response: response})
    });

    // 监听客户端发送到房间内的消息
    socket.on('sendMessage', (roomID, message) => {
        console.log(`Message to room ${roomID}:`, message);
        io.to(roomID).emit('receiveMessage', message); // 向房间内所有客户端广播消息

    });

    // 监听客户端断开连接的事件
    socket.on('disconnect', (roomID) => {
        console.log('A client disconnected:', socket.id);
    });
    socket.on('disConnect', (data) => {
        const index = rooms[data.roomID].findIndex(item => item.socketId === socket.id)
        if(index !== -1){
            rooms[data.roomID].splice(index, 1)
        }
        console.log('A client disconnected:', socket.id);
    });
});



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// exports.Client = Client;
