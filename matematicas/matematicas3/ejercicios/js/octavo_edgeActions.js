
(function($, Edge, compId){
var Composition = Edge.Composition, Symbol = Edge.Symbol; // los alias más comunes para las clases de Edge

   //Edge symbol: 'stage'
   (function(symbolName) {


      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 2500, function(sym, e) {
         var anirobot = sym.getSymbol("robot");
         anirobot.play();

      });
      //Edge binding end

      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 17000, function(sym, e) {

var anirobot_err_atras = sym.getSymbol("robot_error");

anirobot_err_atras.playReverse();

      });
      //Edge binding end

      

      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 13000, function(sym, e) {
         var aniroboterror = sym.getSymbol("robot_error");
         aniroboterror.play();

      });
      //Edge binding end

      

      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 20000, function(sym, e) {
sym.stop();

      });
      //Edge binding end

      Symbol.bindElementAction(compId, symbolName, "${_home}", "click", function(sym, e) {
        window.top.location.href = "../../../index.html";

      });
      //Edge binding end

      Symbol.bindElementAction(compId, symbolName, "${_mas_principal}", "click", function(sym, e) {
sym.$("mas_principal").hide();
sym.$("txt_play").hide();
sym.play();

      });
      //Edge binding end

      Symbol.bindElementAction(compId, symbolName, "${_txt_play}", "click", function(sym, e) {
         sym.$("mas_principal").hide();
         sym.$("txt_play").hide();
         sym.play();

      });
      //Edge binding end

   })("stage");
   //Edge symbol end:'stage'

   //=========================================================
   
   //Edge symbol: 'rostro'
   (function(symbolName) {   
   
      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 4937, function(sym, e) {
         
         sym.play("ciclo1");
         

      });
      //Edge binding end

   })("rostro");
   //Edge symbol end:'rostro'

   //=========================================================
   
   //Edge symbol: 'robot'
   (function(symbolName) {   
   
      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 6000, function(sym, e) {
         // introducir código aquí
         
         // Buscar el objeto JavaScript de símbolo de Edge Animate en un elemento que sea
         // una instancia de símbolo. El objeto de símbolo puede usarse para invocar
         // las funciones de símbolo como reproducir, detener, etc.
         var anirobot = sym.getSymbol("robot");
         
          anirobot.stop();

      });
      //Edge binding end

   })("robot");
   //Edge symbol end:'robot'

   //=========================================================
   
   //Edge symbol: 'robot_error'
   (function(symbolName) {   
   
   })("robot_error");
   //Edge symbol end:'robot_error'

})(jQuery, AdobeEdge, "EDGE-6620539");
