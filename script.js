var socket = io();
let socketioId;
let roomId;
$(".entrance").css("display", "block");
$(".inRoom").css("display", "none");

$('#comfield').attr({"class":"gradation_"+Math.floor(Math.random() * 6)})
$('#name').on('change', function(e) {
    var msg = this.value
    socket.emit('change name', msg);
    return false;
})

$('#comfield').on('input', function(e) {
    var msg = this.value
    socket.emit('chat message', msg);
    return false;
})

$("#createRoom").click(function(e) {
    const roomname = window.prompt("部屋名を入れてください", "");
    if (roomname) {
        $("#roomName").text(roomname);
        socket.emit('create room', roomname);
    } else {
        alert("キャンセルされた")
    }

})

$(document).on('click', '.room', function(){
    roomId =  $(this).attr('id');
    console.log(roomId)
    $("#roomName").text(roomId);
    socket.emit('join room', roomId);
});

$("#exitRoom").click(function(){
    socket.emit('exit room', roomId);
    $(".entrance").css("display", "block");
    $(".inRoom").css("display", "none");
})


socket.on('init id', function(id){
    socketioId = id;
});

socket.on('chat message', function(msg){
    $("#text_"+msg.id).text(msg.msg);
});

socket.on('change name', function(name){
    console.log(name)
    $("#name_"+name.id).text(name.name);
});

socket.on('update users', function(users){
    console.log(users);
    $(".entrance").css("display", "none");
    $(".inRoom").css("display", "block");
    $('.userbox').remove();
    delete users[socketioId]
    // users.splice(Object.keys(users).indexOf(socketioId), 1)
    for (var i = 0; i < Object.keys(users).length; i++) {
        const id = Object.keys(users)[i]
        $('<div>').attr({'id': id, "class":"userbox gradation_"+Math.floor(Math.random() * 6)}).appendTo("#users")
        $('<p class="name">').attr('id', "name_"+id).appendTo("#"+id)
        $('<p class="text">').attr('id', "text_"+id).appendTo("#"+id)
        $("#text_"+id).text(users[id]);
    }
});


socket.on('create room', function(status){
    if (status) {
        $(".entrance").css("display", "none");
        $(".inRoom").css("display", "block");

    } else {
        alert("もうすでにあるらしい")
    }
});
socket.on('update rooms', function(rooms){
    $("#rooms").empty();
    for (var i = 0; i < rooms.length; i++) {
        const id = rooms[i]
        $('<div>').attr({'id': id, "class":"room gradation_"+Math.floor(Math.random() * 6)}).appendTo("#rooms")
        $('<h3>').attr('id', "name_"+id).text(id).appendTo("#"+id)
    }
});


