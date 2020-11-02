
window.addEventListener('load',function(){
    let nombre = document.querySelector('.nombre')
    let nickname = prompt("Nickname: ")
    nombre.innerHTML=nickname;
    sessionStorage.setItem("ciegoNickname",nickname);


});