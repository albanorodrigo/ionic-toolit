angular.module('starter')

.service('SoporteEstadisticaService', function ($q, SoporteEstadistica) {

  function cargarPromedioEjecucion(fechaDesde, fechaHasta) {
    if (!(fechaDesde && fechaHasta)) {
      return $q.reject("Se debe indicar \"fecha desde\" y \"fecha hasta\"");
    }
    var data_send = {
      fechaDesde: moment(fechaDesde).format("YYYY-MM-DD[T]HH:mm:ss"),
      fechaHasta: moment(fechaHasta).format("YYYY-MM-DD[T]HH:mm:ss")
    };
    return SoporteEstadistica.promedioEjecucion(data_send).$promise.then(function (data) {
      console.log("*** Estadisticas de \"promedio de ejecucion\" ***");
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al estadisticas de \"promedio de ejecucion\" ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar estadisticas de soportes!");
    });
  }

  function cargarPromedioReaccion(fechaDesde, fechaHasta) {
    if (!(fechaDesde && fechaHasta)) {
      return $q.reject("Se debe indicar \"fecha desde\" y \"fecha hasta\"");
    }
    var data_send = {
      fechaDesde: moment(fechaDesde).format("YYYY-MM-DD[T]HH:mm:ss"),
      fechaHasta: moment(fechaHasta).format("YYYY-MM-DD[T]HH:mm:ss")
    };
    return SoporteEstadistica.promedioReaccion(data_send).$promise.then(function (data) {
      console.log("*** Estadisticas de \"promedio de reaccion\" ***");
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al estadisticas de \"promedio de reaccion\" ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar estadisticas de soportes!");
    });
  }

  function cargarPromedioAsignado(fechaDesde, fechaHasta) {
    if (!(fechaDesde && fechaHasta)) {
      return $q.reject("Se debe indicar \"fecha desde\" y \"fecha hasta\"");
    }
    var data_send = {
      fechaDesde: moment(fechaDesde).format("YYYY-MM-DD[T]HH:mm:ss"),
      fechaHasta: moment(fechaHasta).format("YYYY-MM-DD[T]HH:mm:ss")
    };
    return SoporteEstadistica.promedioAsignado(data_send).$promise.then(function (data) {
      console.log("*** Estadisticas de \"promedio de soporte asignado\" ***");
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al estadisticas de \"promedio de soporte asignado\" ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar estadisticas de soportes!");
    });
  }

  function cargarCantidadEstadoCierre(fechaDesde, fechaHasta) {
    if (!(fechaDesde && fechaHasta)) {
      return $q.reject("Se debe indicar \"fecha desde\" y \"fecha hasta\"");
    }
    var data_send = {
      fechaDesde: moment(fechaDesde).format("YYYY-MM-DD[T]HH:mm:ss"),
      fechaHasta: moment(fechaHasta).format("YYYY-MM-DD[T]HH:mm:ss")
    };
    return SoporteEstadistica.cantidadEstadoCierre(data_send).$promise.then(function (data) {
      console.log("*** Estadisticas de \"cantidad de soportes por estado de cierre\" ***");
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al estadisticas de \"cantidad de soportes por estado de cierre\" ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar estadisticas de soportes!");
    });
  }

  function cargarCantidadEstadoCierreSemana(fecha) {
    if (!fecha) {
      return $q.reject("Se debe indicar una fecha");
    }
    var data_send = {
      fecha: moment(fecha).format("YYYY-MM-DD[T]HH:mm:ss"),
    };
    return SoporteEstadistica.cantidadEstadoCierreSemana(data_send).$promise.then(function (data) {
      console.log("*** Estadisticas de \"cantidad de soportes por estado de cierre semanal\" ***");
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al estadisticas de \"cantidad de soportes por estado de cierre semanal\" ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar estadisticas de soportes!");
    });
  }

  return {
    cargarPromedioEjecucion: cargarPromedioEjecucion,
    cargarPromedioReaccion: cargarPromedioReaccion,
    cargarPromedioAsignado: cargarPromedioAsignado,
    cargarCantidadEstadoCierre: cargarCantidadEstadoCierre,
    cargarCantidadEstadoCierreSemana: cargarCantidadEstadoCierreSemana,
  };

})

.run(function () {

})

.provider('SoporteEstadistica', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(null, {fechaDesde: "@fechaDesde", fechaHasta: "@fechaHasta"}, {
      promedioEjecucion: {
        method: 'GET',
        isArray: true,
        url: API_URLS.soporte.estadisticas.promedioEjecucion,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      promedioReaccion: {
        method: 'GET',
        isArray: true,
        url: API_URLS.soporte.estadisticas.promedioReaccion,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      promedioAsignado: {
        method: 'GET',
        isArray: true,
        url: API_URLS.soporte.estadisticas.promedioAsignado,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      cantidadEstadoCierre: {
        method: 'GET',
        isArray: true,
        url: API_URLS.soporte.estadisticas.cantidadEstadoCierre,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      cantidadEstadoCierreSemana: {
        method: 'GET',
        isArray: true,
        url: API_URLS.soporte.estadisticas.cantidadEstadoCierreSemana,
        params: {fecha: '@fecha'},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function SoporteEstadistica() {

    }

    SoporteEstadistica.promedioEjecucion = metodos.promedioEjecucion;
    SoporteEstadistica.promedioReaccion = metodos.promedioReaccion;
    SoporteEstadistica.promedioAsignado = metodos.promedioAsignado;
    SoporteEstadistica.cantidadEstadoCierre = metodos.cantidadEstadoCierre;
    SoporteEstadistica.cantidadEstadoCierreSemana = metodos.cantidadEstadoCierreSemana;
    return SoporteEstadistica;
  };

});