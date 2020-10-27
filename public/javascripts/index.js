
window.addEventListener('load',function(){
    let socket = io.connect(location.origin)
    
    let texto = document.querySelector('.texto')
    let boton = document.querySelector('.boton')
    let chat = document.querySelector('.chat')
    let nickname = prompt("Nickname: ")
    let contador = document.querySelector('.contador');
    let nombres = document.querySelector('.nombres');
    let idNum;
    // let cartas = document.querySelectorAll('.carta')
    sessionStorage.setItem("ciegoNickname",nickname);
    socket.on("connect",()=>{
        idNum = (socket.id);
    })
    
    
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

    // cartas.forEach((carta,index) => {
    //     carta.addEventListener('click',function(e){
    //         carta.querySelector('.imagenCarta').classList.toggle('oculto')
    //         carta.querySelector('.dorso').classList.toggle('oculto')
    //         socket.emit('borrar',index)
    //     })
    // });

    // socket.on('borrar',(data)=>{
    //     cartas[data].querySelector('.imagenCarta').classList.toggle('oculto')
    //     cartas[data].querySelector('.dorso').classList.toggle('oculto')
       
    // })

});