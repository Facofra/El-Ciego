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
    let turnoNombre = document.querySelector('.turnoNombre');
    let iniciar = document.querySelector('.iniciar');
    let deck = document.querySelector('.mazo');
    let pila = document.querySelector('.pila');
    let nickname = sessionStorage.getItem("ciegoNickname");
    let idNum;
    let enjuego = false;

// estructas que vienen del server   
    let Mazo;
    let Pila;
    let Jugadores;
    let Partida;



    let carta5 = document.querySelector('.carta5');
    let jugador1=document.querySelector('.jugador1');
    let jugador2=document.querySelector('.jugador2');
    let jugador3=document.querySelector('.jugador3');
    let jugador4=document.querySelector('.jugador4');
    let players = document.querySelectorAll('.players');
    let playerNames = document.querySelectorAll('.playerName')
    
    if (nickname == null) {
        nickname = prompt("Nickname: ")
    }

    socket.on("connect",()=>{
// ####################### conectarse ##################
        idNum = (socket.id);
        socket.on("initPila",(data)=>{
            Pila = data;
        })
        
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
            enjuego=true;

            while (Jugadores[0].id != idNum ) {
                Jugadores.push(Jugadores.shift());
            }

            playerNames[0].innerHTML= Jugadores[0].nombre + " (vos)"

            for (let i = 1; i < Jugadores.length; i++) {
                playerNames[i].innerHTML = Jugadores[i].nombre;
            }

            for (let i = 0; i < Jugadores.length; i++) {

                if (Jugadores[i].turno) {
                    turnoNombre.innerHTML = Jugadores[i].nombre;
                }

                let cartas =players[i].querySelectorAll('.carta');
                cartas.forEach((carta,idx)=>{
                    carta.innerHTML= `<img src="/images/cartas/${Jugadores[i].mano[idx].imagen}" alt="">`
                })
            }

        })
// ------------------------fin iniciar juego -------------------------
        
// ##################### tomar mazo ######################
        deck.addEventListener('click',()=>{
            if (Jugadores[0].turno) {
                socket.emit("tomar",idNum);
            }
        })

        socket.on('tomar',(jugador)=>{
            for (let i = 0; i < Jugadores.length; i++) {
                if(Jugadores[i].id == jugador.id){
                    Jugadores[i] = jugador;
                }
            }

            if (jugador.id == idNum) {
                carta5.innerHTML = `<img src="/images/cartas/${jugador.cartaTemporal.imagen}" alt="">` ;
            }
            
        })
// ##################### fin tomar mazo ######################

// ------------------------depositar en pila -------------------------

        pila.addEventListener("click",()=>{
            if (Jugadores[0].cartaTemporal!=null) {
                carta5.innerHTML="";
                Jugadores[0].cartaTemporal=null;
                socket.emit("apilar",idNum);
                socket.emit("proxTurno");

            } else if (Jugadores[0].turno && Pila.cartas.length > 0) {
                carta5.innerHTML = pila.innerHTML;
                Jugadores[0].cartaTemporal= Pila.ultima;
                socket.emit("desapilar",idNum);
            }

        })
        socket.on("apilar",data=>{
            Pila = data;
            pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`;
        })
        socket.on("desapilar",data=>{
            Pila = data;
            if (Pila.ultima==null) {
                pila.innerHTML="";
            }else{
                pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`
            }
        })

        socket.on("proxTurno",data=>{
            Jugadores=data;
            console.log("antes");
            console.log(Jugadores[0]);
            while (Jugadores[0].id != idNum ) {
                Jugadores.push(Jugadores.shift());
            }
            console.log("despues");
            console.log(Jugadores[0]);
            for (const jugador of Jugadores) {
                if (jugador.turno) {
                    turnoNombre.innerHTML = jugador.nombre;
                }
            }
        })

// ------------------------fin depositar en pila -------------------------
        
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