// JavaScript Document
var uno = "                                                                                                                                                                                                                          Completa la siguente tabla, sustituyendo valores para  \"x\" y \"y\", de tal modo, que se cumpla con la igualdad de la ecuación.";
 
var a = 60;
var  tres ="";

function escribir(){
    var dos = uno.charAt(a)

	a = a + 1;
    tres = tres +  dos;
    document.getElementById("caja").innerHTML = tres;
}

setInterval("escribir()", 100)
