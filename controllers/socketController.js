function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

class Jugador{
  constructor(nombre,id){
    this.nombre = nombre;
    this.id = id;
    this.mano=[];
  }
}

module.exports={
    index: function(io){

        let jugadores=[];
        let mazo=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

        io.sockets.on('connection',(socket)=>{
            
            socket.on('listarme',nombre=>{
              io.sockets.emit('conexion',io.engine.clientsCount);
              // let jugador = {
              //   nombre,
              //   id: socket.id
              // }
              let jugador = new Jugador(nombre,socket.id);
              jugadores.push(jugador);
              console.log(jugadores);
              io.sockets.emit('lista',jugadores);
            })
            
            socket.on('disconnect',()=>{
              console.log("usuario desconectado: " + socket.id );
              jugadores = jugadores.filter(e=> e.id != socket.id);
              console.log(jugadores);

              io.sockets.emit('lista',jugadores);
              io.sockets.emit('conexion',io.engine.clientsCount);
            })
          
            socket.on('conversacion',(data)=>{
              //socket.broadcast.emit('conversacion',data)
              io.sockets.emit('conversacion',data)
            })
          
            socket.on("mezclar",(data)=>{
              shuffleArray(mazo);

              io.sockets.emit("mezclar",mazo);
            })
          
            socket.on("repartir",()=>{
              for(jugador of jugadores){
                for (let i = 0; i < 4; i++) {
                  jugador.mano.push(mazo.pop())            
                }
              }
              io.sockets.emit("repartir",jugadores);
            })











            socket.on('borrar',(data)=>{
              socket.broadcast.emit('borrar',data)
            })
          
          
          })

    }
}