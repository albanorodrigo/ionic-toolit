angular.module('starter')

.service('RutinaService', function ($rootScope, $q, $http, Rutina, RutinaEjecucion, BroadcastService, AUTH_EVENTS, APP_EVENTS) {

  var STORAGE_NUEVOS_COUNT_KEY = 'rutina-nuevas-count'; //Cantidad de rutinas nuevas actuales

  var initOK = false;
  var rutinas = $q.defer().promise;

  function init() {
    if (!initOK) {
      updateBadgeNumber();
      BroadcastService.registrar($rootScope, AUTH_EVENTS.logout, function () {
        clearCantidadRutinasNuevas();
      });
      initOK = true;
    }
  }

  //Actualiza una rutina en la lista de rutinas
  var actualizarRutina = function (rutina) {
    if (rutina) {
      rutinas = rutinas.then(function (data) {
        data.forEach(function (s, i) {
          if (s.idRutina === rutina.idSoporte) {
            data[i] = rutina;
          }
        });
        return data;
      });
      //Informar que se modifico el soporte
      //BroadcastService.broadcast(APP_EVENTS.soporte.modificado, rutina);
    }
  };

  var updateBadgeNumber = function () {
    console.log("*** EVENT TRIGGER RutinaService: RUTINA REFRESH -> BADGE MENU ***");
    var data = {badgeType: "rutina", number: getCantidadRutinasNuevas()};
    BroadcastService.broadcast(APP_EVENTS.menu.badgesRefresh, data);
  };

  var actualizarCantidadRutinasNuevas = function () {
    console.log("*** Actualizar cantidad de soportes nuevos ***");
    rutinas.then(function (data) {
      window.localStorage.setItem(STORAGE_NUEVOS_COUNT_KEY, data.length);
      updateBadgeNumber();
    });
  };

  var clearCantidadRutinasNuevas = function () {
    console.log("*** Limpiar cantidad de rutinas nuevas ***");
    window.localStorage.removeItem(STORAGE_NUEVOS_COUNT_KEY);
    updateBadgeNumber();
  };

  function getCantidadRutinasNuevas() {
    return window.localStorage.getItem(STORAGE_NUEVOS_COUNT_KEY);
  }

  function cargarRutinas() {
    return Rutina.listado().$promise;
  }

  function cargarEjecucionesAbiertas(incluirSoportes) {
    console.log("*** Cargar lista de ejecuciones de rutinas (abiertas) ***");
    return RutinaEjecucion.listadoEjecucionesAbiertas({}).$promise.then(function (ejecuciones) {
      if (incluirSoportes) {
        //Carga la lista de soportes dentro de la ejecucion
        var promises = [];
        ejecuciones.forEach(function (e, i) {
          //Recorro las ejecuciones y agrego la promesa del get soportes de la ejecucion
          promises.push(RutinaEjecucion.listadoSoportes({id: e.idRutinaEjecucion}, function (soportes) {
            e.soportes = soportes;
          }).$promise);
        });
        //retorno torno el grupo de promesas
        return $q.all(promises).then(function () {
          //sobrescribo el retorno para retornar las ejecuciones
          return $q.resolve(ejecuciones);
        });
      }
      return $q.resolve(ejecuciones);
    }, function (error) {
      console.log("*** Error al cargar lista de ejecuciones de rutinas (abiertas) ***");
      return $q.reject(error);
    });
  }

  return {
    getRutinas: function () {
      return rutinas;
    },
    init: init,
    getCantidadRutinasNuevas: getCantidadRutinasNuevas,
    cargarRutinas: cargarRutinas,
    cargarEjecucionesAbiertas: cargarEjecucionesAbiertas
  };

})

.run(function ($rootScope, RutinaService, BroadcastService, APP_EVENTS, NOTIFICATION_EVENTS, APP_STATES) {


})

.provider('Rutina', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.rutina.detalle, {id: '@id'}, {
      listado: {
        method: 'GET',
        isArray: true,
        url: API_URLS.rutina.listado,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      listadoPorNombre: {
        method: 'GET',
        isArray: true,
        url: API_URLS.rutina.listadoPorNombre,
        params: {nombre: "@nombre"},
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
      proximaEjecucion: {
        url: API_URLS.rutina.proximaEjecucion,
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      proximasEjecuciones: {
        url: API_URLS.rutina.proximasEjecuciones,
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function Rutina() {

    }

    Rutina.listado = metodos.listado;
    Rutina.listadoPorNombre = metodos.listadoPorNombre;
    Rutina.get = metodos.get;
    Rutina.proximaEjecucion = metodos.proximaEjecucion;
    Rutina.proximasEjecuciones = metodos.proximasEjecuciones;
    return Rutina;
  };

})

.provider('RutinaEjecucion', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.rutinaEjecucion.detalle, {id: '@id'}, {
      listadoAdmin: {
        method: 'GET',
        isArray: true,
        url: API_URLS.rutinaEjecucion.listadoAdmin,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      listadoPorUsuarioAdmin: {
        method: 'GET',
        isArray: true,
        url: API_URLS.rutinaEjecucion.listadoPorUsuarioAdmin,
        params: {idUsuario: "@idUsuario"},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      listadoEjecucionesAbiertasAdmin: {
        method: 'GET',
        isArray: true,
        url: API_URLS.rutinaEjecucion.listadoEjecucionesAbiertasAdmin,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      listadoEjecucionesAbiertas: {
        method: 'GET',
        isArray: true,
        url: API_URLS.rutinaEjecucion.listadoEjecucionesAbiertas,
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
      listadoSoportes: {
        method: 'GET',
        isArray: true,
        url: API_URLS.rutinaEjecucion.listadoSoportes,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      generarSoportes: {
        url: API_URLS.rutinaEjecucion.generarSoportes,
        method: 'POST',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function RutinaEjecucion() {

    }

    RutinaEjecucion.listadoAdmin = metodos.listadoAdmin;
    RutinaEjecucion.listadoPorUsuarioAdmin = metodos.listadoPorUsuarioAdmin;
    RutinaEjecucion.listadoEjecucionesAbiertasAdmin = metodos.listadoEjecucionesAbiertasAdmin;
    RutinaEjecucion.listadoEjecucionesAbiertas = metodos.listadoEjecucionesAbiertas;
    RutinaEjecucion.get = metodos.get;
    RutinaEjecucion.listadoSoportes = metodos.listadoSoportes;
    RutinaEjecucion.generarSoportes = metodos.generarSoportes;
    return RutinaEjecucion;
  };

});