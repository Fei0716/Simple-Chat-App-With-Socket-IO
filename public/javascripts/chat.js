// dom elements
const btnSendAllDom = document.querySelector('#btn-send-all');
const inputDom = document.querySelector('#input');
const chatOutputDom = document.querySelector('#chat-output');
const onlineUsersDom = document.querySelector('#online-users');

//states
let users = [];

//create instance of socket io
//socket configs
const socket = io("http://localhost:3000");
socket.on('connect', ()=>{
    console.log('connected to socket io');
});
//when there's new message from any other users connected to the socket
socket.on("receiveMessage", (message) => {
    chatOutputDom.innerHTML += `
        <div>${message}</div>
    `
});
//get the list of current online users when first time connected to the socket
socket.on("getSocketIds", (ids) =>{
    users = ids;
    //reset dom
    onlineUsersDom.innerHTML = '<h2>List of Online Users</h2>';
    for(let u of users){
        //append to list of online users dom
        onlineUsersDom.innerHTML += `
        <div class="user-socket" data-socket-id="${u}">
             ${u}
        </div>
    `
    }
});

//listen for new user joining the chat
socket.on("newUserJoined", (newUserSocketId) =>{
    //append to the online users list
    users.push(newUserSocketId);

    //update list dom
    onlineUsersDom.innerHTML += `
        <div class="user-socket" data-socket-id="${newUserSocketId}">
             ${newUserSocketId}
        </div>
    `
});

//when there's a user disconnected
socket.on("userDisconnected", (id) =>{
    //remove from the array
    users.splice( users.findIndex( u => u === id) , 1);
    //update list dom
    document.querySelector(`.user-socket[data-socket-id="${id}"]`).remove();

});

// add event listeners
btnSendAllDom.addEventListener('click', function(){
    if(inputDom.value !== ''){
        socket.emit('sendMessage' , {
            message: inputDom.value,
        });

        //append the message to dom(sender)
        chatOutputDom.innerHTML += `
            <div>${inputDom.value}</div>
        `

        //clear the input
        inputDom.value = '';
    }
});



