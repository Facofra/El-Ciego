function findById(id,jugadores){
  for (const jugadoraux of jugadores) {
    if (jugadoraux.id == id) {
      return jugadoraux;
    }
  }
}

let {Pila,Jugador,Partida,Mazo,Carta}= require("../classes/classes");

module.exports={
    index: function(io){
        let pila= new Pila();
        let partida= new Partida();
        let mazo= new Mazo();
        mazo.crear();


        io.sockets.on('connection',(socket)=>{
            io.sockets.emit("initPila",pila);
            
            socket.on('listarme',nombre=>{
              io.sockets.emit('conexion',io.engine.clientsCount);

              let jugador = new Jugador(nombre,socket.id);
              partida.sumarJugador(jugador);

              io.sockets.emit('lista',partida.jugadores);
            })
            
            socket.on('disconnect',()=>{
              console.log("usuario desconectado: " + socket.id );
              partida.restarJugador(socket.id);

              io.sockets.emit('lista',partida.jugadores);
              io.sockets.emit('conexion',io.engine.clientsCount);
            })
          
            socket.on('conversacion',(data)=>{
              //socket.broadcast.emit('conversacion',data)
              io.sockets.emit('conversacion',data)
            })
          
            socket.on("iniciar",(data)=>{
              mazo.mezclar();
              partida.iniciar(mazo);
              io.sockets.emit("iniciar",mazo);
              io.sockets.emit("repartija",partida);

            })

            socket.on("tomar",(id)=>{
              let jugador = findById(id,partida.jugadores);
              jugador.tomar(mazo);

              io.sockets.emit("tomar",jugador);

            })

            socket.on("apilar",id=>{
              let jugador = findById(id,partida.jugadores);
              
              pila.agregar(jugador.descartar())
              
              io.sockets.emit("apilar",pila)
            })
            
            socket.on("desapilar",id=>{
              let jugador = findById(id,partida.jugadores);
              jugador.tomar(pila);
              
              
              io.sockets.emit("desapilar",pila)
            })

            socket.on("proxTurno",()=>{
              partida.proximoTurno();
              io.sockets.emit("proxTurno",partida.jugadores);
            })









            // socket.on('borrar',(data)=>{
            //   socket.broadcast.emit('borrar',data)
            // })
          
          
          })

    }
}