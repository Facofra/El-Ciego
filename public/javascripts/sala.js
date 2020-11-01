const alertTime=5;
window.addEventListener('load',function(){
    let socket = io.connect(location.origin);
 
    let cartasEnMazo= document.querySelector('.tamanioMazo')
    let contador = document.querySelector('.contador');
    let nombres = document.querySelector('.nombres');
    let turnoNombre = document.querySelector('.turnoNombre');
    let iniciar = document.querySelector('.iniciar');
    let deck = document.querySelector('.mazo');
    let pila = document.querySelector('.pila');
    let nickname = sessionStorage.getItem("ciegoNickname");
    let alerta = document.querySelector('.alerta');
    let cerrar = document.querySelector('.cerrar');
    let cortar = document.querySelector('.cortar');

    cerrar.addEventListener('click',()=>{
        alerta.style.display = "none";
    })

    let idNum;
    let enJuego = false;
    let hayPerdedor=false;
    let reemplazoHecho=false;

// estructuras que vienen del server   
    let Mazo;
    let Pila;
    let Jugadores;
    let Partida;



    let jugador1=document.querySelector('.jugador1');
    let carta5 = document.querySelector('.carta5');
    let misCartas=jugador1.querySelectorAll('.carta');
    let cartasTotales = document.querySelectorAll('.carta');

    let jugador2=document.querySelector('.jugador2');
    let jugador3=document.querySelector('.jugador3');
    let jugador4=document.querySelector('.jugador4');


    let players = document.querySelectorAll('.players');
    let playerNames = document.querySelectorAll('.playerName')
    
    if (nickname == null) {
        nickname = prompt("Nickname: ")
    }

    socket.on("connect",()=>{
// ####################### conectarse ########################################################################
        idNum = (socket.id);
        
        socket.emit('listarme',nickname);
        
        socket.on('lista',jugadores=>{
            nombres.innerHTML="";
            for (const jugador of jugadores) {
                if (jugador.id == idNum) {
                    nombres.innerHTML += `<li style="color: goldenrod;"> ${jugador.nombre} <span class="pts ${jugador.id}">0 </span></li>`
                }else{
                    nombres.innerHTML += `<li > ${jugador.nombre}  <span class="pts ${jugador.id}">0 </span></li>`
                }
            }
        })
        socket.on('conexion',data=>{
            contador.innerHTML = data;
        })
// ###############################################################################################
        socket.on("disconnect",()=>{
            alert("empiezen devuelta, se desconectó")
        })
        
// ------------------------ iniciar juego----------------------------------------------------------------------------------------
        iniciar.addEventListener("click",()=>{
            socket.emit("iniciar",hayPerdedor);
            
        })
        socket.on("iniciar",({mazo,stack})=>{
            Pila=stack;
            iniciar.style.display = "none";
            Mazo = mazo;
            cartasEnMazo.innerHTML = mazo.cartas.length;
            pila.innerHTML="";
            deck.innerHTML= `<img src="/images/cartas/dorso.png" alt="">`;
            
        })
        
        socket.on("repartija",partida=>{
            Partida = partida;

            actualizarJugadores(Partida.jugadores)

            
            for (let i = 0; i < Jugadores.length; i++) {
                playerNames[i].innerHTML = Jugadores[i].nombre;

                if (Jugadores[i].turno) {
                    turnoNombre.innerHTML = Jugadores[i].nombre;
                    if (Jugadores[i].id == idNum) {
                        cortar.style.display="unset";
                    }
                }

                let cartas =players[i].querySelectorAll('.carta');
                cartas.forEach((carta,idx)=>{
                    if ((idx == 2 || idx == 3) && Jugadores[i].id == idNum ) {
                        carta.innerHTML= `<img src="/images/cartas/${Jugadores[i].mano[idx].imagen}" alt="">`
                    }else{
                        carta.innerHTML= `<img src="/images/cartas/dorso.png" alt="">`
                    }
                })

                setTimeout(()=>{
                    cartas.forEach((carta,idx)=>{
                        carta.innerHTML= `<img src="/images/cartas/dorso.png" alt="">`;
                        enJuego=true;                  
                    })  
                    indicarTurno(players)
                },5000)
            }

        })
// ----------------------------------------------------------------------------------------------------------------
        
// ##################### tomar mazo ############################################################################
        deck.addEventListener('click',()=>{
            if (Jugadores[0].turno && Jugadores[0].cartaTemporal==null && Mazo.cartas.length>0 && enJuego) {
                cortar.style.display="none";
                socket.emit("tomar",idNum);
            }
        })

        socket.on('tomar',({jugador,mazo})=>{
            for (let i = 0; i < Jugadores.length; i++) {
                if(Jugadores[i].id == jugador.id){
                    Jugadores[i] = jugador;
                }
            }

            if (jugador.id == idNum) {
                carta5.innerHTML = `<img src="/images/cartas/${jugador.cartaTemporal.imagen}" alt="">` ;
            }
            Mazo = mazo;
            cartasEnMazo.innerHTML = Mazo.cartas.length;
            if (Mazo.cartas.length == 0) {
                deck.innerHTML="Mazo vacío";
            }
            
        })
// ############################################################################################################

// ------------------------depositar en pila -------------------------------------------------------------------

        pila.addEventListener("click",()=>{
            if (enJuego) {
                if (Jugadores[0].cartaTemporal!=null) {
                    carta5.innerHTML="";
                    Jugadores[0].cartaTemporal=null;
                    socket.emit("apilar",idNum);
    
                } else if (Jugadores[0].turno && Pila.cartas.length > 0) {
                    carta5.innerHTML = pila.innerHTML;
                    Jugadores[0].cartaTemporal= Pila.ultima;
                    cortar.style.display="none";
                    socket.emit("desapilar",idNum);
                }
            }

        })
        socket.on("apilar",({data,jugadores})=>{
            Pila = data;
            pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`;
            reemplazoHecho=false;

            actualizarJugadores(jugadores)
            for (const jugador of Jugadores) {
                if (jugador.turno) {
                    turnoNombre.innerHTML = jugador.nombre;
                    if (jugador.id == idNum) {
                        cortar.style.display="unset";
                    }
                }
            }

            indicarTurno(players)
        })
        socket.on("desapilar",data=>{
            Pila = data;
            if (Pila.ultima==null) {
                pila.innerHTML="";
            }else{
                pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`
            }
        })


// -----------------------------------------------------------------------------------------------------------------------

// ##################################### reemplazar mano por carta en mesa y espejito ####################################################
        misCartas.forEach((carta,idx)=>{
            carta.addEventListener("click",function(){
                if (Jugadores[0].mano[idx]!=null && enJuego) {
                    if (Jugadores[0].turno && Jugadores[0].cartaTemporal!=null && !reemplazoHecho) {
                        reemplazoHecho=true;
                        socket.emit("reemplazo",idx);
                    }else if(Pila.ultima !=null){
                        if (Jugadores[0].mano[idx].numero == Pila.ultima.numero) {
                            socket.emit("espejito",idx);
                        }else{
                            socket.emit("equivocacion");
                        }
                    }
                    
                }
            })
        })

        socket.on("espejito",({data,jugador})=>{
            Pila = data;
            pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`;
            Jugadores.forEach((j,i)=>{
                if (j.id == jugador.id) {
                    Jugadores[i]=jugador;
                }
            })

            for (let i = 0; i < Jugadores.length; i++) {
                if (Jugadores[i].id == jugador.id) {
                    let cartas =players[i].querySelectorAll('.carta');
                    cartas.forEach((carta,idx)=>{
                        if (Jugadores[i].mano[idx]==null) {
                            carta.innerHTML= "";
                        }
                    })
                }
            }

        })
        socket.on("reemplazo",({jugadorId,stack,jugadores})=>{
            Pila = stack;
            reemplazoHecho=false;

            actualizarJugadores(jugadores)
            for (const jugador of Jugadores) {
                if (jugador.turno) {
                    turnoNombre.innerHTML = jugador.nombre;
                    if (jugador.id == idNum) {
                        cortar.style.display="unset";
                    }
                }
            }

            if(jugadorId == idNum){
                carta5.innerHTML = "";
            }
            pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`;

            indicarTurno(players)
        })

        socket.on("equivocacion",(jugador)=>{
            alertar(jugador.nombre + ` se equivocó <br> 10 puntos`);
            Jugadores.forEach((j,i)=>{
                if (j.id == jugador.id) {
                    Jugadores[i]=jugador;
                }
            })
            let puntaje=document.querySelector('.'+jugador.id);
            puntaje.innerHTML=jugador.puntaje;
        })
// ############################################################################################################


// ---------------------------------------------CORTAR-----------------------------------------------------------------------
        

        cortar.addEventListener('click',()=>{
            if (Jugadores[0].turno && enJuego && Jugadores[0].cartaTemporal==null) {
                cortar.style.display="none";
                socket.emit("cortar");
                setTimeout(()=>{
                    socket.emit("iniciar",hayPerdedor);
                },5000)
            }
        })

        socket.on("cortar",({jugadores,nombre})=>{
            enJuego=false;
            alertar(nombre + " ha cortado")

            actualizarJugadores(jugadores)

            Jugadores.forEach((jugador,indice) => {
                let puntaje=document.querySelector('.'+jugador.id);
                puntaje.innerHTML=jugador.puntaje;

                
                let cartas =players[indice].querySelectorAll('.carta');
                cartas.forEach((carta,idx)=>{
                    if (Jugadores[indice].mano[idx] != null) {
                        carta.innerHTML= `<img src="/images/cartas/${Jugadores[indice].mano[idx].imagen}" alt="">`
                    }
                })

                if (jugador.puntaje>99) {
                    hayPerdedor=true;
                    alertar("Perdedor: " + jugador.nombre)
                }
                
            });
            Jugadores.forEach((e,i) => {
                players[i].style.borderColor="black";
                console.log("me meti");
            });
            
        })
// --------------------------------------------------------------------------------------------------------------------



    })
// ############################################ FUNCIONES AUXILIARES #######################################################
    function alertar(mensaje){
        let message = document.querySelector('.message');
        message.innerHTML=mensaje;
        alerta.style.display = "flex";
        setTimeout(()=>{
            alerta.style.display = "none";
        },alertTime*1000)
    }

    function indicarTurno(players){
        Jugadores.forEach((jugador,i) => {
            if (Jugadores[i].turno) {
                players[i].style.borderColor="goldenrod";
            }else{
                players[i].style.borderColor="black";
            }
        });
    }

    function actualizarJugadores(jugadores) {
        Jugadores=jugadores;
        while (Jugadores[0].id != idNum ) {
            Jugadores.push(Jugadores.shift());
        }
    }
// ############################################ FUNCIONES AUXILIARES #######################################################

});

