const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const PORT = 3000;
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname,'public')));

const botName = 'chatBot';

//run when client connects
io.on('connection',socket =>{
    
socket.on('joinRoom',({username,room})=>{
    const user = userJoin(socket.id,username,room);

    socket.join(user.room);


    // welcome current user
socket.emit('message',formatMessage(botName,'welcome to chat app'));


// broadcast when a user connects
socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));


//send user and room information
io.to(user.room).emit('roomUsers',{
    room: user.room,
    users: getRoomUsers(user.room)
});

});


//Listen for chatmessage
socket.on("chatMessage", (msg) =>{
const user = getCurrentUser(socket.id);
 io.to(user.room).emit('message',formatMessage(user.username,msg));
});


//runs when client disconnects
socket.on('disconnect',()=>{
const user = userLeave(socket.id);

if(user){
    io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
}
//send user and room information
io.to(user.room).emit('roomUsers',{
    room: user.room,
    users:getRoomUsers(user.room)
});    
});

});




server.listen(PORT,()=>{console.log("server started")});