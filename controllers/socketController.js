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
        


        io.sockets.on('connection',(socket)=>{
            // io.sockets.emit("initPila",pila);
            
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
              io.sockets.emit('conversacion',data)
            })
          
            socket.on("iniciar",(hayPerdedor)=>{
              pila.vaciar()
              mazo.crear();
              mazo.mezclar();
              partida.iniciar(mazo);
              io.sockets.emit("iniciar",{mazo,stack:pila});
              if (hayPerdedor) {
                partida.jugadores.forEach(jugador=>{
                  jugador.puntaje=0;
                })
              }
              io.sockets.emit("repartija",partida);

            })

            socket.on("tomar",(id)=>{
              let jugador = findById(id,partida.jugadores);
              jugador.tomar(mazo);

              io.sockets.emit("tomar",{jugador,mazo});

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

            socket.on("reemplazo",(indice)=>{
              let jugador = findById(socket.id,partida.jugadores);
              jugador.reemplazar(indice);
              io.sockets.emit("reemplazo",{jugador,indice});
            })

            socket.on("espejito",(idx)=>{
              let jugador = findById(socket.id,partida.jugadores);
              jugador.reemplazar(idx);
              pila.agregar(jugador.descartar());

              io.sockets.emit("espejito",{data:pila,jugador});
            })

            socket.on("equivocacion",()=>{
              let jugador = findById(socket.id,partida.jugadores);
              jugador.puntaje+=10;

              io.sockets.emit("equivocacion",jugador);
            })

            socket.on("cortar",()=>{
              let jugador = findById(socket.id,partida.jugadores);
              partida.cortar(jugador);

              io.sockets.emit("cortar",{jugadores:partida.jugadores,nombre:jugador.nombre})
            })


          
          
          })

    }
}