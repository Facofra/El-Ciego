function findById(id,jugadores){
  for (const jugadoraux of jugadores) {
    if (jugadoraux.id == id) {
      return jugadoraux;
    }
  }
}

let {Pila,Jugador,Partida,Mazo}= require("../classes/classes");

module.exports={
    index: function(io){
        let pila= new Pila();
        let partida= new Partida();
        let mazo= new Mazo();
        


        io.sockets.on('connection',(socket)=>{
            console.log("usuario conectado: " + socket.id);
            socket.on('listarme',nombre=>{

              let jugador = new Jugador(nombre,socket.id);
              partida.sumarJugador(jugador);

              io.sockets.emit('lista',{jugadores:partida.jugadores,cantidad:io.engine.clientsCount});
            })
            
            socket.on('disconnect',()=>{
              console.log("usuario desconectado: " + socket.id );
              partida.restarJugador(socket.id);

              io.sockets.emit('lista',{jugadores:partida.jugadores,cantidad:io.engine.clientsCount});
            })
          
            socket.on("iniciar",(hayPerdedor)=>{
              pila.vaciar()
              mazo.crear();
              mazo.mezclar();
              partida.iniciar(mazo);
              if (hayPerdedor) {
                partida.jugadores.forEach(jugador=>{
                  jugador.puntaje=0;
                })
              }
              io.sockets.emit("iniciar",{mazo,stack:pila,partida});

            })

            socket.on("tomar",(id)=>{
              let jugador = findById(id,partida.jugadores);
              jugador.tomar(mazo);

              io.sockets.emit("tomar",{jugador,mazo});

            })

            socket.on("apilar",id=>{
              let jugador = findById(id,partida.jugadores);
              
              pila.agregar(jugador.descartar())
              partida.proximoTurno();
              
              io.sockets.emit("apilar",{data:pila,jugadores:partida.jugadores})
            })
            
            socket.on("desapilar",id=>{
              let jugador = findById(id,partida.jugadores);
              jugador.tomar(pila);
              
              
              io.sockets.emit("desapilar",pila)
            })

            socket.on("reemplazo",(indiceDeCarta)=>{
              let jugador = findById(socket.id,partida.jugadores);
              jugador.reemplazar(indiceDeCarta);
              pila.agregar(jugador.descartar());
              partida.proximoTurno();;

              io.sockets.emit("reemplazo",{jugadorId:jugador.id,stack:pila,jugadores:partida.jugadores,indiceDeCarta});
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

            socket.on("cortar",(finMazo)=>{
              let jugador = findById(socket.id,partida.jugadores);
              partida.cortar(jugador,finMazo);

              io.sockets.emit("cortar",{jugadores:partida.jugadores,nombre:jugador.nombre})
            })

            socket.on("efecto2",(data)=>{

              socket.broadcast.emit("efecto2",data);
            })

            socket.on("efecto1",(data)=>{
              let jugador = findById(socket.id,partida.jugadores);
              let oponente = findById(data.idOponente,partida.jugadores);
              oponente.cartaTemporal = jugador.mano[data.cartaMia];
              oponente.reemplazar(data.cartaOponente);
              jugador.mano[data.cartaMia] = oponente.cartaTemporal;
              oponente.cartaTemporal=null;

              let datos={
                jugadores:partida.jugadores,
                data,
                nombreOponente:oponente.nombre,
                nombreJugador: jugador.nombre
              }

              io.sockets.emit("efecto1",datos);
            })


          
          
          })

    }
}