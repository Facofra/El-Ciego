class Carta{
    constructor(numero,palo){
        this.numero=numero;
        this.palo=palo;
        this.imagen=null;
        this.deCara=false;
    }
}

class Mazo{
    constructor(){
        this.cartas=[];
    }

    esVacio(){
        return this.cartas.length == 0;
    }

    crear(){
        
        for (const palo of ["pica","trebol","diamante","corazon"]) {
            for (let i = 0; i < 13; i++) {
                this.agregar(new Carta(i%13+1,palo));
            }
        }
    }

    agregar(carta){
        this.cartas.push(carta);
    }

    popear(){
        return this.cartas.pop();
    }

    mezclar(){
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }

    mostrar(){
        for (const carta of this.cartas) {
            console.log(carta);
        }
    }
}

class Jugador{
    constructor(nombre,id){
        this.nombre=nombre;
        this.id=id;
        this.mano=[];
        this.cartaTemporal=null;
        this.puntaje=0;
        this.turno=false;
    }

    tomar(pilaOMazo){
        this.cartaTemporal= pilaOMazo.popear();
    }

    descartar(){
        let aux = this.cartaTemporal;
        this.cartaTemporal=null;
        return aux;
    }

    reemplazar(posicion){
        let aux=this.cartaTemporal;
        this.cartaTemporal=(this.mano.splice(posicion-1,1,aux))[0];
    }

}

class Partida{
    constructor(){
        this.jugadores=[];
        this.turno=null;
    }

    sumarJugador(jugador){
        this.jugadores.push(jugador);
    }

    restarJugador(socketId){
        this.jugadores = this.jugadores.filter(e=> e.id != socketId);
    }

    iniciar(mazo){
        this.turno = this.jugadores[0].id;
        this.jugadores[0].turno=true;
        this.repartir(mazo);
    }

    proximoTurno(){
        this.jugadores[this.turno]=false;
        if (this.turno < this.jugadores.length-1) {
            this.turno++;
        }else{
            this.turno=0;
        }
        this.jugadores[this.turno]=true;
        
    }

    repartir(mazo){
        for (const jugador of this.jugadores) {
            for (let i = 0; i < 4; i++) {
                jugador.mano.push(mazo.popear())
            }
        }
    }
}

class Pila{
    constructor(){
        this.cartas=[];
    }

    agregar(carta){
        this.cartas.push(carta);
    }

    vaciar(){
        let aux = [...this.cartas];
        this.cartas=[];
        return aux;
    }

    popear(){
        return this.cartas.pop();
    }
}



module.exports= {Pila,Jugador,Mazo,Carta,Partida};
