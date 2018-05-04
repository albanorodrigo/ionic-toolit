angular.module('starter')

.service('MensajeService', function ($q, Mensaje, BroadcastService, APP_EVENTS) {

  var initOK = false;
  var mensajes = $q.defer().promise;

  function init() {
    if (!initOK) {
      updateBadgeNumber();
      initOK = true;
    }
  }

  function updateBadgeNumber() {
    console.log("*** EVENT TRIGGER MensajeService: MENSAJE REFRESH -> BADGE MENU ***");
    var data = {badgeType: "mensaje", number: "15"};
    //BroadcastService.broadcast(APP_EVENTS.menu.badgesRefresh, data);
  }

  function cargarMensajes() {
    console.log("*** Cargar lista de mensajes ***");
    mensajes = Mensaje.listado({}, function (data) {
      //console.log(data);
      //actualizarCantidadSoportesNuevos();
      //actualizarSoportesNotificaciones();
    }, function (error) {
      console.log("*** Error al cargar lista de mensajes ***");
    }).$promise;
    return mensajes;
  }

  function cargarMensaje(idMensaje) {
    console.log("*** Cargar mensaje id: " + idMensaje + " ***");
    if (!idMensaje) {
      return $q.reject("El \"id\" del mensaje es nulo.");
    }
    return Mensaje.get({id: idMensaje}).$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar mensaje id:" + idMensaje + " ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar mensaje!");
    });
  }

  return {
    init: init,
    cargarMensajes: cargarMensajes,
    cargarMensaje: cargarMensaje
  };

})

.run(function (MensajeService, APP_EVENTS) {
  MensajeService.init();
  //Registrar eventos del modulo de mensajes
})

.provider('Mensaje', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.mensaje.detalle, {id: '@id'}, {
      listado: {
        method: 'GET',
        isArray: true,
        url: API_URLS.mensaje.listado,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      get: {
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      recibido: {
        url: API_URLS.mensaje.recibido,
        method: 'PUT',
        params: {ts: "@ts"},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {ts: aux.body} : aux.body;
          }
          return data;
        }
      },
      leido: {
        url: API_URLS.mensaje.leido,
        method: 'PUT',
        params: {ts: "@ts"},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {ts: aux.body} : aux.body;
          }
          return data;
        }
      },
    });

    function Mensaje() {

    }

    Mensaje.listado = metodos.listado;
    Mensaje.get = metodos.get;
    Mensaje.leido = metodos.leido;
    Mensaje.recibido = metodos.recibido;
    return Mensaje;
  };

});