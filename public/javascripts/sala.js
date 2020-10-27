
window.addEventListener('load',function(){
    let socket = io.connect(location.origin);

    function enviar(emisor,mensaje) {
        let data = {
            emisor,
            mensaje
        }
        socket.emit('conversacion',data)
    }
    
    let texto = document.querySelector('.texto')
    let boton = document.querySelector('.boton')
    let chat = document.querySelector('.chat')
    let contador = document.querySelector('.contador');
    let nombres = document.querySelector('.nombres');
    let iniciar = document.querySelector('.iniciar');
    let deck = document.querySelector('.mazo');
    let nickname = sessionStorage.getItem("ciegoNickname");
    let idNum;
    
    let Mazo;
    let Pila;
    let Jugadores;
    let Partida;

    let jugador1=document.querySelector('.jugador1');
    let jugador2=document.querySelector('.jugador2');
    let jugador3=document.querySelector('.jugador3');
    let jugador4=document.querySelector('.jugador4');
    let players = document.querySelectorAll('.players');
    
    if (nickname == null) {
        nickname = prompt("Nickname: ")
    }

    socket.on("connect",()=>{
        // ####################### conectarse ##################
        idNum = (socket.id);
        
        socket.emit('listarme',nickname);
        
        socket.on('lista',jugadores=>{
            nombres.innerHTML="";
            for (const jugador of jugadores) {
                if (jugador.id == idNum) {
                    nombres.innerHTML += `<li style="color: blue;"> ${jugador.nombre} (vos) </li>`
                }else{
                    nombres.innerHTML += `<li > ${jugador.nombre}  </li>`
                    
                }
            }
        })
        socket.on('conexion',data=>{
            contador.innerHTML = data;
        })
        // ####################### fin conectarse ##################
        
        
        // ------------------------ iniciar juego-------------------------
        iniciar.addEventListener("click",()=>{
            socket.emit("iniciar");
        })
        socket.on("iniciar",(mazo)=>{
            Mazo = mazo;
            deck.innerHTML = mazo.cartas.length;
        })
        
        socket.on("repartija",partida=>{
            Partida = partida;
            Jugadores = Partida.jugadores;

            while (Jugadores[0].id != idNum ) {
                Jugadores.push(Jugadores.shift());
            }

            players[0].innerHTML= jugadores[0].nombre + " (vos)"

            for (let i = 1; i < Jugadores.length; i++) {
                players[i].innerHTML = Jugadores[i].nombre;
            }

        })
        
        // ------------------------fin iniciar juego -------------------------

        // ##################### chatear ######################
        boton.addEventListener('click',(e)=>{
            enviar(nickname,texto.value)
            texto.value = ""
        })

        texto.addEventListener('keypress',e=>{
            if (e.keyCode == 13) {
                enviar(nickname,texto.value)
                texto.value = ""
            }
        })

        socket.on('conversacion',(data)=>{
            chat.innerHTML += `<li>${data.emisor}: ${data.mensaje}</li>`
        })
        // #################### fin chatear ######################
    })

});