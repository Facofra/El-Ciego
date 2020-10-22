
window.addEventListener('load',function(){
    let socket = io.connect(location.origin);
    
    let texto = document.querySelector('.texto')
    let boton = document.querySelector('.boton')
    let chat = document.querySelector('.chat')
    let nickname = prompt("Nickname: ")
    let contador = document.querySelector('.contador');
    let nombres = document.querySelector('.nombres');
    let mezclar = document.querySelector('.mezclar');
    let repartir = document.querySelector('.repartir');
    let mazo = document.querySelector('.mazo');
    let mano = document.querySelector('.mano');
    
    socket.emit('listarme',nickname);
    
    socket.on('lista',jugadores=>{
        nombres.innerHTML="";
        for (const jugador of jugadores) {
            if (jugador.nombre == nickname) {
                nombres.innerHTML += `<li style="color: blue;"> ${jugador.nombre} (vos) </li>`
            }else{
                nombres.innerHTML += `<li > ${jugador.nombre}  </li>`

            }
        }
    })
    socket.on('conexion',data=>{
        contador.innerHTML = data;
    })

    mezclar.addEventListener("click",()=>{
        socket.emit("mezclar");
    })
    socket.on("mezclar",(cartas)=>{
        mazo.innerHTML = cartas;
    })

    repartir.addEventListener("click",()=>{
        socket.emit("repartir");
    })
    socket.on("repartir",(jugadores)=>{

        let jugador = jugadores.find(e=>{
            return e.nombre == nickname;
        })

        console.log(jugador);
        mano.innerHTML = jugador.mano;
        socket.emit("mezclar");
    })


    function enviar() {
        let data = {
            emisor: nickname,
            mensaje: texto.value
        }
        socket.emit('conversacion',data)
    }

    boton.addEventListener('click',(e)=>{
        enviar()
        texto.value = ""
    })

    texto.addEventListener('keypress',e=>{
        if (e.keyCode == 13) {
            enviar()
            texto.value = ""
        }
    })

    socket.on('conversacion',(data)=>{
        chat.innerHTML += `<li>${data.emisor}: ${data.mensaje}</li>`
    })


});