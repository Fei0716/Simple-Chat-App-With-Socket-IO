const socket = require("socket.io");

let socketIds = [];//store the users' socket id
module.exports =  function(server){
   const io =  socket(server, {
        cors:{
            origin: ['*'],
        }
    });
    io.on("connection", socket => {
        //emit notify all users that a new user has join the socket connection
        //send list of socketIds to the new user
        socketIds.push(socket.id);

        socket.emit('getSocketIds', socketIds);

        socket.broadcast.emit("newUserJoined", socket.id);

        socket.on("sendMessage" , (data)=>{
            //send to all users including the sender
            //io.emit("receiveMessage", data.message);

            //broadcast the message to all users except the sender
            socket.broadcast.emit("receiveMessage", data.message);

        });

        //when the user disconnected remove his socket id
        socket.on('disconnect' , ()=>{
            console.log(`User: ${socket.id} has disconnected`);
            //remove from the array of socket ids
            socketIds.splice(socketIds.findIndex(s => s === socket.id) , 1);
            //broadcast event to notify the users about disconnection of the user
            io.emit("userDisconnected" , socket.id);
        });
    })
};