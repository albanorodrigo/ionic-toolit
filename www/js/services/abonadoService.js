angular.module('starter')

.service('AbonadoService', function ($q, Abonado) {

  function cargarAbonado(idAbonado) {
    console.log("*** Cargar datos del abonado ID: " + idAbonado + " ***");
    return Abonado.get({id: idAbonado}, function (data) {
      //datos del abonado cargados...
    }, function (error) {
      //error al cargar datos del abonado...
      console.log("*** Error al cargar datos del abonado ***");
    }).$promise;
  }

  function cargarServiciosAbonado(idAbonado) {
    console.log("*** Cargar servicios del abonado ID: " + idAbonado + " ***");
    return Abonado.servicios({id: idAbonado}, function (data) {
      //servicios del abonado cargados...
    }, function (error) {
      //error al cargar servicios del abonado...
      console.log("*** Error al cargar servicios del abonado ***");
    }).$promise;
  }

  function cargarEquiposAbonado(idAbonado, idLugar) {
    console.log("*** Cargar equipos del abonado ID: " + idAbonado + " ***");
    return Abonado.equipos({idAbonado: idAbonado, idLugar: idLugar}, function (data) {
      //equipos del abonado cargados...
    }, function (error) {
      //error al cargar equipos del abonado...
      console.log("*** Error al cargar equipos del abonado ***");
    }).$promise;
  }

  return {
    cargarAbonado: cargarAbonado,
    cargarServiciosAbonado: cargarServiciosAbonado,
    cargarEquiposAbonado: cargarEquiposAbonado
  };

})

.provider('Abonado', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.abonado.detalle, {id: '@id'}, {
      listado: {
        url: API_URLS.abonado.listado,
        method: 'GET',
        isArray: true,
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
      servicios: {
        url: API_URLS.abonado.servicios,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      equipos: {
        url: API_URLS.equipo.listadoPorAbonado,
        method: 'GET',
        isArray: true,
        params: {idAbonado: "@idAbonado", idLugar: "@idLugar"},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function Abonado() {

    }

    Abonado.listado = metodos.listado;
    Abonado.get = metodos.get;
    Abonado.servicios = metodos.servicios;
    Abonado.equipos = metodos.equipos;
    return Abonado;
  };

});