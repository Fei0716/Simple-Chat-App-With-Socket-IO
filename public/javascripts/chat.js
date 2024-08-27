// dom elements
const btnSendDom = document.querySelector('#btn-send');
const inputDom = document.querySelector('#input');
const chatOutputDom = document.querySelector('#chat-output');
const onlineUsersDom = document.querySelector('#online-users');
const roomDom = document.querySelector('#room');
const btnJoinDom = document.querySelector('#btn-join');

//states
let users = [];
let room;
//create instance of socket io
//socket configs
const socket = io("http://localhost:3000/chat", {
    //passing token here for authentication
    auth:{
        token: "auth_token_here"
    }
});//we are using the socket with the namespace of chat
socket.on('connect', ()=>{
    console.log('connected to socket io', socket);
});
//when there's new message from any other users connected to the socket
socket.on("receiveMessage", (message , sender) => {
    chatOutputDom.innerHTML += `
    <div class="chat"> 
        <h3>
            ${sender}
        </h3>
        <p>
            ${message}
        </p> 
        
    </div>
    `
});
//get the list of current online users when first time connected to the socket
socket.on("getSocketIds", (ids) =>{
    users = ids;
    //reset dom
    onlineUsersDom.innerHTML = '<h2>List of Online Users</h2>';
    for(let u of users){
        let userSocketDiv = document.createElement('div');
        userSocketDiv.classList.add('user-socket');
        userSocketDiv.setAttribute('data-socket-id', u);
        userSocketDiv.textContent = u;
        if(u === socket.id){
            userSocketDiv.classList.add('current-user');
            userSocketDiv.textContent = u + ' (You)' ;
            onlineUsersDom.append(userSocketDiv);
        }else{
            userSocketDiv.textContent = u ;
            onlineUsersDom.append(userSocketDiv);
        }

        //add click event to each of the user-socket
            userSocketDiv.addEventListener("click", (e) =>{
                //if chatting clicking on the current user
                if(e.target.getAttribute('data-socket-id') === socket.id){
                    return;
                }
                //remove selected class from the other .user-socket
                let selectedUserSocket = document.querySelector(".user-socket.selected");
                if(selectedUserSocket){
                    selectedUserSocket.classList.remove('selected');
                    if(selectedUserSocket.getAttribute('data-socket-id') === e.target.getAttribute('data-socket-id')){
                        //if clicked on a user socket that already have .selected, remove it
                        e.target.classList.remove('selected');
                        return;
                    }
                }

                e.target.classList.add('selected');
            });
    }
});

//listen for new user joining the chat
socket.on("newUserJoined", (newUserSocketId) =>{
    //append to the online users list
    users.push(newUserSocketId);
    let userSocketDiv = document.createElement('div');
    userSocketDiv.classList.add('user-socket');
    userSocketDiv.setAttribute('data-socket-id', newUserSocketId);
    userSocketDiv.textContent = newUserSocketId;

    //update list dom
    onlineUsersDom.append(userSocketDiv) ;
    //add event listener to the new .user-socket
    userSocketDiv.addEventListener("click", (e) =>{
        //if chatting clicking on the current user
        if(e.target.getAttribute('data-socket-id') === socket.id){
            return;
        }


        //remove selected class from the other .user-socket
        let selectedUserSocket = document.querySelector(".user-socket.selected");
        if(selectedUserSocket){
            selectedUserSocket.classList.remove('selected');

            if(selectedUserSocket.getAttribute('data-socket-id') === e.target.getAttribute('data-socket-id')){
                //if clicked on a user socket that already have .selected, remove it
                e.target.classList.remove('selected');
                return;
            }
        }

        e.target.classList.add('selected');
    });

});

//when there's a user disconnected
socket.on("userDisconnected", (id) =>{
    //remove from the array
    users.splice( users.findIndex( u => u === id) , 1);
    //update list dom
    document.querySelector(`.user-socket[data-socket-id="${id}"]`).remove();

});

// add event listeners
btnSendDom.addEventListener('click', function(){
    if(inputDom.value === '')return;
    let selectedUserSocket = document.querySelector('.selected');

    if(room ){
        //if joined a room send to the users in the room
        socket.emit('sendMessage' , {
            message: inputDom.value,
        }, null ,room);
    }
    else if(selectedUserSocket){
        //if there's a selected socket send to the user
        socket.emit('sendMessage' , {
            message: inputDom.value,
        }, selectedUserSocket.getAttribute('data-socket-id'));
    }
    else{
        //else send to all online users
        socket.emit('sendMessage' , {
            message: inputDom.value,
        });
    }
    //append the message to dom(sender)
    chatOutputDom.innerHTML += `
            <div class="chat chat-current-user">
                <h3 class="text-end">You</h3>
                <p class="text-end">
                ${inputDom.value}
                </p>
            </div>
        `

    //clear the input
    inputDom.value = '';
});

btnJoinDom.addEventListener('click', function(){
    if(roomDom.value === '')return;

    //emit join room event back to the server to join a roow
    socket.emit("joinRoom", roomDom.value, (message)=>{
        //callback from the server
        chatOutputDom.innerHTML += `
            <div class="notification">
                ${message}
            </div>     
        `;
    });
    room = roomDom.value;
    roomDom.value = '';
});


