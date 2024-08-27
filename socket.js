const socket = require("socket.io");

let socketIds = [];//store the users' socket id
module.exports =  function(server){
   const io =  socket(server, {
        cors:{
            origin: ['*'],
        }
    });
    //create a custom namespace
    const chatIo = io.of("/chat");

    //adding middleware to check for auth token
    chatIo.use((socket, next) =>{
        console.log('authToken: '+ socket.handshake.auth.token);
        next();
    });


    chatIo.on("connection", socket => {
        //emit notify all users that a new user has join the socket connection
        //send list of socketIds to the new user
        socketIds.push(socket.id);

        socket.emit('getSocketIds', socketIds);

        socket.broadcast.emit("newUserJoined", socket.id);

        socket.on("sendMessage" , (data , user , room)=>{
            //send to all users including the sender
            //io.emit("receiveMessage", data.message);

            //to send private message to a specific user
            if(user){
                socket.to(user).emit("receiveMessage", data.message, socket.id);
                return;
            }
            if(room){
                socket.to(room).emit("receiveMessage", data.message, socket.id);
                return;
            }
            //broadcast the message to all users except the sender
            socket.broadcast.emit("receiveMessage", data.message , socket.id);
        });

        socket.on("joinRoom", (room, cb)=>{
            //join a specific room
            socket.join(room);
            //run the callback function in the client to send back a message
            cb(`Joined Room: ${room}`);
        });

        //when the user disconnected remove his socket id
        socket.on('disconnect' , ()=>{
            console.log(`User: ${socket.id} has disconnected`);
            //remove from the array of socket ids
            socketIds.splice(socketIds.findIndex(s => s === socket.id) , 1);
            //broadcast event to notify the users about disconnection of the user
            chatIo.emit("userDisconnected" , socket.id);
        });
    })

};