const path = require("path");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.join(__dirname, '/')));

let users = {};
let rooms = [];

io.on('connection', (socket) => {
  console.log("connect")
  socket.emit('update rooms',rooms);
  socket.emit('init id',socket.id);
  console.log(rooms)

  socket.on('create room', (room) => {
    console.log(room)

    if (!rooms.includes(room)) {
      socket.emit('create room',true);
      socket.join(room)
      rooms.push(room);
      users[socket.id] = {"roomId" : room, "text":""}
      socket.broadcast.emit('update rooms',rooms);
      console.log(users)
    } else {
      socket.emit('create room',false);
    }
    console.log(rooms);
  });

  socket.on('join room', (room) => {
    console.log("JOIN ROOM")
    socket.join(room)

    users[socket.id] = {"roomId" : room, "text":""}

    let usersList = {}
    Object.keys(users).forEach((userId) => {
      if (users[userId].roomId == room) {
        // usersList.push(userId)
        usersList[userId] = users[userId].text
      }
    });

    // usersList.splice(usersList.indexOf(socket.id), 1)
    console.log(usersList);
    // socket.emit('update users', usersList);


    console.log(users)
    io.to(room).emit('update users', usersList);


  });

  socket.on('change name', (name) => {
    console.log(name)
    if (Object.keys(users).includes(socket.id)) {
      let room = users[socket.id].roomId
      socket.broadcast.to(room).emit('change name', {"name": name, "id": socket.id});
    }
  });

  socket.on('chat message', (msg) => {
    console.log(msg)
    if (Object.keys(users).includes(socket.id)) {
      let room = users[socket.id].roomId;
      users[socket.id].text = msg;
      socket.broadcast.to(room).emit('chat message', {"msg": msg, "id": socket.id});
    }
  });

  socket.on('exit room', (room) => {
    if (Object.keys(users).includes(socket.id)) {
      delete users[socket.id]
      socket.leave(room);

      let usersList = {}
      Object.keys(users).forEach((userId) => {
        if (users[userId].roomId == room) {
          // usersList.push(userId)
          usersList[userId] = users[userId].text
        }
      });

      io.to(room).emit('update users', usersList);
      if (!Array.from(io.of("/").adapter.rooms.keys()).includes(room)) {
        rooms.splice(rooms.indexOf(room), 1)
        io.emit('update rooms',rooms);
      }
      console.log(rooms);
    }
  });

  socket.on('disconnect', () => {
    console.log("disconnect")
    // socket.broadcast.emit('exituser', socket.id);
    if (Object.keys(users).includes(socket.id)) {
      let room = users[socket.id].roomId

      delete users[socket.id]
      socket.leave(room);

      let usersList = {}
      Object.keys(users).forEach((userId) => {
        if (users[userId].roomId == room) {
          usersList[userId] = users[userId].text
        }
      });

      io.to(room).emit('update users', usersList);
      if (!Array.from(io.of("/").adapter.rooms.keys()).includes(room)) {
        rooms.splice(rooms.indexOf(room), 1)
        io.emit('update rooms',rooms);
      }
      console.log(rooms);
    }

  });
});

// ポート3000番でサーバを起動します。
server.listen(3000, () => {
  console.log('listening on *:3000');
});