angular.module('starter')

.service('DebugService', function (BroadcastService, APP_EVENTS) {

  var initOK = false;
  var debugHtml = '';

  function init() {
    if (!initOK) {
      cargarDatos();
      initOK = true;
    }
  }

  function dispararEventoRefresh() {
    console.log("*** EVENT TRIGGER DebugService: DEBUG REFRESH ***");
    BroadcastService.broadcast(APP_EVENTS.debugRefresh, debugHtml);
  }

  function cargarDatos() {
    //...
    //dispararEventoRefresh();
  }

  function agregarLinea(texto) {
    debugHtml += texto + "<br/>";
    dispararEventoRefresh();
  }

  return {
    init: init,
    agregarLinea: agregarLinea
  };

})

.run(function (DebugService) {
  DebugService.init();
})