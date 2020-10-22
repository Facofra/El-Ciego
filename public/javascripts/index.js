
window.addEventListener('load',function(){
    
    let texto = document.querySelector('.texto')
    let boton = document.querySelector('.boton')
    let lista = document.querySelector('.lista')
    let nickname = prompt("Nickname: ")
    let cartas = document.querySelectorAll('.carta')
    

    let socket = io.connect('http://localhost:3000')

    function enviar() {
        let data = {
            emisor: nickname,
            mensaje: texto.value
        }
        socket.emit('conversacion',data)
    }

    boton.addEventListener('click',(e)=>{
        enviar()
    })

    texto.addEventListener('keypress',e=>{
        if (e.keyCode == 13) {
            enviar()
            texto.value = ""
        }
    })

    socket.on('conversacion',(data)=>{
        lista.innerHTML += `<li>${data.emisor}: ${data.mensaje}</li>`
    })

    cartas.forEach((carta,index) => {
        carta.addEventListener('click',function(e){
            carta.querySelector('.imagenCarta').classList.toggle('oculto')
            carta.querySelector('.dorso').classList.toggle('oculto')
            socket.emit('borrar',index)
        })
    });

    socket.on('borrar',(data)=>{
        cartas[data].querySelector('.imagenCarta').classList.toggle('oculto')
        cartas[data].querySelector('.dorso').classList.toggle('oculto')
       
    })

});