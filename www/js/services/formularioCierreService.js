angular.module('starter')

.service('FormularioCierreService', function ($q, FormularioCierre) {

  var $formulariosCierre = $q.defer();

  function cargarFormulariosCierre() {
    console.log("*** Cargar lista de formularios de cierre activos ***");
    return FormularioCierre.activos({}, function (data) {
      console.log(data);
      //estados = data;
      $formulariosCierre.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar lista de formularios de cierre activos ***");
      $formulariosCierre.reject(error);
    }).$promise;
  }

  function cargarFormularioCierre(idFormulario) {
    console.log("*** Cargar formulario de cierre id: " + idFormulario + " ***");
    if (!idFormulario) {
      return $q.reject("El \"id\" del formulario es nulo.");
    }
    return FormularioCierre.get({id: idFormulario}).$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar formulario de cierre id:" + idFormulario + " ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar formulario de cierre!");
    });
  }

  return {
    getFormulariosCierre: function () {
      return $formulariosCierre.promise;
    },
    cargarFormularioCierre: cargarFormularioCierre,
    cargarFormulariosCierre: cargarFormulariosCierre
  };

})

.provider('FormularioCierre', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.formulariocierre.detalle, {id: '@id'}, {
      get: {
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      activos: {
        url: API_URLS.formulariocierre.activos,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      all: {
        url: API_URLS.formulariocierre.todos,
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function FormularioCierre() {

    }

    FormularioCierre.all = metodos.all;
    FormularioCierre.get = metodos.get;
    FormularioCierre.activos = metodos.activos;
    return FormularioCierre;
  };

})

.factory('FormularioCierreData', function () {
  function FormularioCierreData(idFormularioCierre) {
    this.idFormularioCierre = idFormularioCierre;
    this.camposEstaticos = {};
    this.camposDinamicos = {};
    this.firma = {data: "", dataType: "", dataEncoding: ""};
  }
  FormularioCierreData.prototype.reset = function () {
    this.camposEstaticos = {};
    this.camposDinamicos = {};
    this.firma = {data: "", dataType: "", dataEncoding: ""};
  };
  FormularioCierreData.prototype.setFirma = function (data, dataType, dataEncoding) {
    this.firma.data = data;
    this.firma.dataType = dataType;
    this.firma.dataEncoding = dataEncoding;
  };
  FormularioCierreData.prototype.setFirmaFromDataURL = function (firma) {
    //FIRMA => data:image/png;base64,iVBORw0K...
    var part1 = (firma) ? firma.split(":") : null;
    var part2 = (part1 && part1[1]) ? part1[1].split(";") : null;
    var part3 = (part2 && part2[1]) ? part2[1].split(",") : null;
    //Obtrener datos
    var dataType = (part2 && part2[0]) ? part2[0] : "";
    var dataEncoding = (part3 && part3[0]) ? part3[0] : "";
    var data = (part3 && part3[1]) ? part3[1] : "";
    //Setear firma
    this.setFirma(data, dataType, dataEncoding);
  };
  return FormularioCierreData;
});