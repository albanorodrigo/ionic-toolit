angular.module('starter')

.service('RegisterService', function ($rootScope, $q, Register, BroadcastService, DebugService, AUTH_EVENTS) {

  var STORAGE_GCM_TOKEN_KEY = 'register-gcm-token'; //Token para servicios de GCM.
  var STORAGE_APNS_TOKEN_KEY = 'register-apns-token'; //Token para servicios de APPLE.

  function getKeyGCM() {
    return window.localStorage.getItem(STORAGE_GCM_TOKEN_KEY);
  }

  function setKeyGCM(gcmKey) {
    //TODO: enviar tambien datos del dispositivo (plataforma, version, etc...)
    //Almacenar key para luego enviarlo al backend
    window.localStorage.setItem(STORAGE_GCM_TOKEN_KEY, gcmKey);
    DebugService.agregarLinea("SET -> APP GCM TOKEN: " + gcmKey);
    //Esperar a que se cargen las credenciales de la API tyt
    BroadcastService.registrar($rootScope, AUTH_EVENTS.loadCredentials, function () {
      //Registra el codigo de GCM en el backend
      registerGCM(gcmKey).then(function (data) {
        console.log("*** APP SEND GCM key "+gcmKey+" to backend - OK ***");
        //ok...
      }, function (error) {
        //error...
      });
    });
  }

  function registerGCM(gcmKey) {
    console.log("*** Registrar \"GCM KEY\" en backend ***");
    return $q(function (resolve, reject) {
      if (gcmKey) {
        Register.registerGCM({'key': gcmKey}, function (data) {
          console.log("*** Registrar \"GCM KEY\" en backend - OK ***");
          console.log(data);
          resolve(data);
        }, function (error) {
          console.log("*** Registrar \"GCM KEY\" en backend - ERROR ***");
          console.log(error);
          reject(error);
        }).$promise;
      } else {
        console.log("*** Error al registrar \"GCM KEY\" en backend - el \"GCM KEY\" es nulo ***");
        reject("Error al registrar \"GCM KEY\" en backend - el \"GCM KEY\" es nulo");
      }
    });
  }

  function unregisterGCM() {
    console.log("*** Eliminar \"GCM KEY\" en backend ***");
    return Register.unregisterGCM({}, function (data) {
      console.log("*** Eliminar \"GCM KEY\" en backend - OK ***");
      console.log(data);
      window.localStorage.removeItem(STORAGE_GCM_TOKEN_KEY);
    }, function (error) {
      console.log("*** Eliminar \"GCM KEY\" en backend - ERROR ***");
      console.log(error);
    }).$promise;
  }

  return {
    getKeyGCM: getKeyGCM,
    setKeyGCM: setKeyGCM,
    registerGCM: registerGCM,
    unregisterGCM: unregisterGCM
  };

})

.provider('Register', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {
    var metodos = $resource(API_URLS.register.GCM, {key: '@key'}, {
      registerGCM: {
        method: 'POST',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      unregisterGCM: {
        method: 'POST',
        params: {key: '-'},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });
    return metodos;
  };

});