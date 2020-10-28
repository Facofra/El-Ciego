function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
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
            
            socket.on('listarme',nombre=>{
              io.sockets.emit('conexion',io.engine.clientsCount);

              let jugador = new Jugador(nombre,socket.id);
              partida.sumarJugador(jugador);

              console.log(partida.jugadores);
              io.sockets.emit('lista',partida.jugadores);
            })
            
            socket.on('disconnect',()=>{
              console.log("usuario desconectado: " + socket.id );
              partida.restarJugador(socket.id);

              
              console.log(partida.jugadores);

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
              console.log(partida.jugadores[0]);

              io.sockets.emit("iniciar",mazo);
              io.sockets.emit("repartija",partida);

            })

            socket.on("tomar",(id)=>{
              let jugador;
              for (const jugadoraux of partida.jugadores) {
                if (jugadoraux.id == id) {
                  jugador=jugadoraux;
                  break;
                }
              }
              jugador.tomar(mazo);

              io.sockets.emit("tomar",jugador);

            })









            // socket.on('borrar',(data)=>{
            //   socket.broadcast.emit('borrar',data)
            // })
          
          
          })

    }
}