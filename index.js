const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

server.listen(8080,function(){
  console.log("Listening at 8080");
});

io.on('connection',function(socket){

  socket.on('create or join',function(room){

    io.in(room).clients(function(error, clients){
      if (error) {
        throw error;
        return;
      }

      if(clients.length >= 2)
      {
        socket.emit('errorMessage',`Could not join room. It's full!`);
        return;
      }

      socket.join(room);

      const joinMessage = {
        initiator : true,
        data : `You have successfully joined ${room}!`
      };

      if(clients.length == 0) {
          socket.emit('joined room',joinMessage);
      } else {
          joinMessage.initiator = false;
          socket.emit('joined room',joinMessage);
          socket.to(room).emit('newcomer','Hi there people!');
      }

      console.log(`${room} room has ${clients.length} people`);
    });

  });

  socket.on('roomMessage',function(roomMessage){

    io.in(roomMessage.room).clients(function(error, clients){
      if (error) {
        throw error;
        return;
      }

      if(clients.indexOf(socket.id)!==-1) {
        console.log(`Client ${socket.id} sent room message : ${roomMessage.room} - ${JSON.stringify(roomMessage.data)}`);
        socket.to(roomMessage.room).emit('roomMessage',roomMessage);
      } else {
        socket.emit('errorMessage',`You don't belong to this room kid!`);
      }

    });

  })

});
