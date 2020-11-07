const alertTime=3;
const colorTime=3;
const cantCartas=4;
const cantJugadoresMax=4;
window.addEventListener('load',function(){
    let socket = io.connect(location.origin);
 
    let cartasEnMazo= document.querySelector('.tamanioMazo')
    let contador = document.querySelector('.contador');
    let nombres = document.querySelector('.nombres');
    let turnoNombre = document.querySelector('.turnoNombre');
    let iniciar = document.querySelector('.iniciar');
    let deck = document.querySelector('.mazo');
    let pila = document.querySelector('.pila');
    let alerta = document.querySelector('.alerta');
    let cerrar = document.querySelector('.cerrar');
    let cortar = document.querySelector('.cortar');
    let nickname = sessionStorage.getItem("ciegoNickname");

    

    let timerAlert=null;
    let idNum;
    let enJuego = false;
    let hayPerdedor=false;
    let reemplazoHecho=false;
    let efecto1=false;
    let efecto1aux={
        activado:false,
        cartaOponente:null,
        cartaMia:null,
        idMio:null,
        idOponente:null
    };
    let efecto2=false;
    let efecto3=false;
    let agarradoDePila=false;
    let espejitoHecho=false;

// estructuras que vienen del server   
    let Mazo;
    let Pila;
    let Jugadores;
    let Partida;



    let jugador1=document.querySelector('.jugador1');
    let carta5 = document.querySelector('.carta5');
    let misCartas=jugador1.querySelectorAll('.carta');
    let cartasTotales = document.querySelectorAll('.carta');
    let puntajeEnMesa= document.querySelectorAll('.puntajeEnMesa');
    let pts= document.querySelectorAll('.pts');

    let jugador2=document.querySelector('.jugador2');
    let jugador3=document.querySelector('.jugador3');
    let jugador4=document.querySelector('.jugador4');


    let players = document.querySelectorAll('.players');
    let playerNames = document.querySelectorAll('.nombresEnMesa')
    
    if (nickname == null) {
        nickname = prompt("Nickname: ")
    }

    cerrar.addEventListener('click',()=>{
        alerta.style.display = "none";
    })

    socket.on("connect",()=>{
// ####################### conectarse ########################################################################
        idNum = (socket.id);
        
        socket.emit('listarme',nickname);
        
        socket.on('lista',({jugadores,cantidad})=>{
            nombres.innerHTML="";
            for (const jugador of jugadores) {
                if (jugador.id == idNum) {
                    nombres.innerHTML += `<li style="color: blue;"> ${jugador.nombre} </li>`
                }else{
                    nombres.innerHTML += `<li > ${jugador.nombre} </li>`
                }
            }
            contador.innerHTML = cantidad;
        })
// ###############################################################################################
        socket.on("disconnect",()=>{
            alert("empiezen devuelta, se desconectó")
        })
        
// ------------------------ iniciar juego----------------------------------------------------------------------------------------
        iniciar.addEventListener("click",()=>{
            socket.emit("iniciar",hayPerdedor);
            
        })
        socket.on("iniciar",({mazo,stack,partida})=>{
            Pila=stack;
            Mazo = mazo;
            Partida = partida;

            hayPerdedor=false;
            iniciar.style.display = "none";
            cartasEnMazo.innerHTML = mazo.cartas.length;
            pila.innerHTML="";
            deck.innerHTML= `<img src="/images/cartas/dorso.png" alt="">`;

            actualizarJugadores(Partida.jugadores)
            
            for (let i = 0; i < Jugadores.length; i++) {
                playerNames[i].innerHTML = Jugadores[i].nombre;
                pts[i].style.display="unset";
                puntajeEnMesa[i].innerHTML=Jugadores[i].puntaje;
                puntajeEnMesa[i].style.display="unset";

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

            colorearElemento(deck,1);
            
        })
// ############################################################################################################

// ------------------------depositar en pila -------------------------------------------------------------------

        pila.addEventListener("click",()=>{
            if (enJuego) {
                if (Jugadores[0].cartaTemporal!=null &&!efecto1 &&!efecto2 &&!efecto3 &&!efecto1aux.activado) {
                    carta5.innerHTML="";
                    Jugadores[0].cartaTemporal=null;
                    agarradoDePila=false;
                    socket.emit("apilar",idNum);
    
                } else if (Jugadores[0].turno && Pila.cartas.length > 0 && !espejitoHecho &&!efecto1 &&!efecto2 &&!efecto3 &&!efecto1aux.activado) {
                    carta5.innerHTML = pila.innerHTML;
                    Jugadores[0].cartaTemporal= Pila.ultima;
                    cortar.style.display="none";
                    agarradoDePila=true;
                    socket.emit("desapilar",idNum);
                }
            }

        })
        socket.on("apilar",({data,jugadores})=>{
            Pila = data;
            pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`;
            reemplazoHecho=false;
            espejitoHecho=false;

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
            if (Mazo.cartas.length == 0 && Jugadores[0].id == idNum) {
                let finMazo=true;
                socket.emit("cortar",finMazo);
                setTimeout(()=>{
                    socket.emit("iniciar",hayPerdedor);
                },5000)
            }
        })
        socket.on("desapilar",data=>{
            Pila = data;
            if (Pila.ultima==null) {
                pila.innerHTML="";
            }else{
                pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`
            }
            colorearElemento(pila,1);
        })


// -----------------------------------------------------------------------------------------------------------------------

// ##################################### reemplazar mano por carta en mesa y espejito ####################################################
        misCartas.forEach((carta,idx)=>{
            carta.addEventListener("click",function(){
                if (Jugadores[0].mano[idx]!=null && enJuego) {
                    if (efecto1aux.activado) {
                        enJuego=false;
                        efecto1aux.activado=false;
                        efecto1aux.cartaMia=idx;
                        socket.emit("efecto1",efecto1aux);
                        setTimeout(()=>{
                            carta5.innerHTML="";
                            enJuego=true;
                            agarradoDePila=false;
                            socket.emit("apilar",idNum);
                        },3000)
                    }
                    else if (efecto3) {
                        enJuego=false;
                        reemplazoHecho=true;
                        efecto3=false;
                        carta.innerHTML = `<img src="/images/cartas/${Jugadores[0].mano[idx].imagen}" alt="">`;
                        setTimeout(()=>{
                            carta.innerHTML=`<img src="/images/cartas/dorso.png" alt="">`;
                            carta5.innerHTML="";
                            enJuego=true;
                            agarradoDePila=false;
                            socket.emit("apilar",idNum);
                        },3000)
                    }else{
                        if (Jugadores[0].turno && Jugadores[0].cartaTemporal!=null && !reemplazoHecho && !efecto2 && !efecto1) {
                            reemplazoHecho=true;
                            agarradoDePila=false;
                            socket.emit("reemplazo",idx);
                        }else if(Pila.ultima !=null){
                            if (Jugadores[0].mano[idx].numero == Pila.ultima.numero) {
                                socket.emit("espejito",idx);
                            }else{
                                if (Jugadores[0].puntaje>=90) {
                                    enJuego=false;
                                    hayPerdedor=true;
                                    setTimeout(()=>{
                                        socket.emit("iniciar",hayPerdedor);
                                    },5000)
                                }
                                socket.emit("equivocacion");
                            }
                        }
                    }
                }
            })
        })

        socket.on("espejito",({data,jugador})=>{
            Pila = data;
            pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`;
            espejitoHecho=true;
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
        socket.on("reemplazo",({jugadorId,stack,jugadores,indiceDeCarta})=>{
            Pila = stack;
            reemplazoHecho=false;

            actualizarJugadores(jugadores)

            Jugadores.forEach((jugador,i) => {
                if (jugador.turno) {
                    turnoNombre.innerHTML = jugador.nombre;
                    if (jugador.id == idNum) {
                        cortar.style.display="unset";
                    }
                }
                if (jugador.id == jugadorId) {
                    let cartas =players[i].querySelectorAll('.carta');
                    cartas.forEach((carta,idx) => {
                        if (idx == indiceDeCarta) {
                            colorearElemento(carta);
                        }
                    });
                }
                
            });

            if(jugadorId == idNum){
                carta5.innerHTML = "";
            }
            pila.innerHTML= `<img src="/images/cartas/${Pila.ultima.imagen}" alt=""></img>`;

            indicarTurno(players)
            if (Mazo.cartas.length == 0 && Jugadores[0].id == idNum) {
                let finMazo=true;
                socket.emit("cortar",finMazo);
                setTimeout(()=>{
                    socket.emit("iniciar",hayPerdedor);
                },5000)
            }
        })

        socket.on("equivocacion",(jugador)=>{
            alertar(jugador.nombre + ` se equivocó <br> 10 puntos`);
            Jugadores.forEach((j,i)=>{
                if (j.id == jugador.id) {
                    Jugadores[i]=jugador;
                    puntajeEnMesa[i].innerHTML=jugador.puntaje;
                }
            })
            if (jugador.puntaje>99) {
                enJuego=false;
                hayPerdedor=true;
                alertar("Perdedor: " + jugador.nombre)
            }
        })
// ############################################################################################################

//----------------------------------------- EFECTOS DE CARTAS ---------------------------------------------------------
        carta5.addEventListener("click",()=>{
            if (Jugadores[0].turno && enJuego && Jugadores[0].cartaTemporal!=null && !agarradoDePila) {
                switch (Jugadores[0].cartaTemporal.numero) {
                    case 1:
                        efectoUno();
                        break;
                    case 2:
                        efectoDos();
                        break;
                    case 3:
                        efectoTres();
                        break;
                
                    default:
                        break;
                }
            }
        })
//----------------------------------------------------------------------------------------------------------------

// ################################## TOCAR CARTA DEL OPONENTE ######################################################
        cartasTotales.forEach((carta,i) => {
            carta.addEventListener('click',()=>{
                let numJugador=Math.floor(i/cantJugadoresMax);
                if (efecto2 && numJugador!=0 && numJugador< Jugadores.length && carta.innerHTML!="") {
                    efecto2=false;
                    enJuego=false;
                    reemplazoHecho=true;

                    let numCarta = i%cantCartas;
                    carta.innerHTML= `<img src="/images/cartas/${Jugadores[numJugador].mano[numCarta].imagen}" alt="">`;
                    //emitir socket de coloreo que muestre que carta vio.
                    socket.emit("efecto2",{
                        nombreJugador: Jugadores[0].nombre,
                        numeroCarta: numCarta,
                        oponenteId:Jugadores[numJugador].id
                    });
                    setTimeout(()=>{
                        carta.innerHTML= `<img src="/images/cartas/dorso.png" alt="">`;
                        carta5.innerHTML="";
                        enJuego=true;
                        agarradoDePila=false;
                        socket.emit("apilar",idNum);
                    },3000);
                }else if (efecto1 && numJugador !=0 && numJugador < Jugadores.length && carta.innerHTML!="") {
                    efecto1=false;
                    efecto1aux.activado=true;
                    reemplazoHecho=true;
                    efecto1aux.cartaOponente= i%cantCartas;
                    efecto1aux.idOponente=Jugadores[numJugador].id;
                    efecto1aux.idMio=idNum;
                    colorearElemento(carta,5);
                }
            })
        });

        socket.on("efecto2",(data)=>{
            alertar(data.nombreJugador + " uso efecto 2 y vio carta del oponente");
            Jugadores.forEach((jugador,i) => {
                if (jugador.id == data.oponenteId) {
                    let cartasOponente = players[i].querySelectorAll('.carta');
                    colorearElemento(cartasOponente[data.numeroCarta]);
                }
            });
        });

        socket.on("efecto1",(datos)=>{
            actualizarJugadores(datos.jugadores);
            alertar(datos.nombreJugador + " intercambio carta con " + datos.nombreOponente);
            Jugadores.forEach((jugador,i) => {
                if (jugador.id == datos.data.idOponente) {
                    let cartas = players[i].querySelectorAll('.carta');
                    colorearElemento(cartas[datos.data.cartaOponente]);
                }
                if (jugador.id == datos.data.idMio) {
                    let cartas = players[i].querySelectorAll('.carta');
                    colorearElemento(cartas[datos.data.cartaMia]);
                }
            });
        })
// ############################################################################################################


// ---------------------------------------------CORTAR-----------------------------------------------------------------------
        

        cortar.addEventListener('click',()=>{
            if (Jugadores[0].turno && enJuego && Jugadores[0].cartaTemporal==null) {
                cortar.style.display="none";
                let finMazo=false;
                socket.emit("cortar",finMazo);
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

                puntajeEnMesa[indice].innerHTML=jugador.puntaje;
                
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
            });
            
        })
// --------------------------------------------------------------------------------------------------------------------



    })
// ############################################ FUNCIONES AUXILIARES #######################################################
    function alertar(mensaje,tiempo=alertTime){
        let message = document.querySelector('.message');
        message.innerHTML=mensaje;
        alerta.style.display = "flex";
        if (timerAlert!=null) {
            clearTimeout(timerAlert);
        }

        timerAlert = setTimeout(()=>{
            alerta.style.display = "none";
            timerAlert=null;
        },tiempo*1000)
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

    function colorearElemento(cosa,tiempo=colorTime){
        cosa.style.outline="goldenrod 3px solid";
        setTimeout(()=>{
            cosa.style.outline="";
        },1000*tiempo)
    }

    function efectoUno(){
        efecto1=true;
        alertar("Click en carta de oponente para cambiar por una tuya");
    }
    function efectoDos(){
        efecto2=true;
        alertar("Click en carta de oponente para verla");
    }

    function efectoTres(){
        efecto3=true;
        alertar("click en una de tus cartas para verla");
    }
// ############################################ FUNCIONES AUXILIARES #######################################################

});

