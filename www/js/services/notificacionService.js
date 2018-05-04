angular.module('starter')

.service('NotificacionService', function (Notificacion, BroadcastService, API_NOTIFICATION_TYPES, NOTIFICATION_EVENTS) {

  var STORAGE_PUSH_NOTIFICATIONS_ENABLED_KEY = 'config-push-notifications-enabled'; //Notificaciones habilitadas

  function procesarNotificacion(event, notificacion) {
    console.log("*** procesarNotificacion: " + event  + " - " + notificacion + " ***");
    //Ejecutar eventos segun tipo de notificacion
    if (notificacion && notificacion.additionalData && notificacion.additionalData.codigo) {
      switch (notificacion.additionalData.codigo) {
        case API_NOTIFICATION_TYPES.soporte.nuevo:
          //Ejecutar eventos de nuevo soporte
          BroadcastService.broadcast(NOTIFICATION_EVENTS.soporte.nuevo, notificacion);
          break;
        case API_NOTIFICATION_TYPES.soporte.modificado:
          //Ejecutar eventos de soporte modificado
          BroadcastService.broadcast(NOTIFICATION_EVENTS.soporte.modificado, notificacion);
          break;
      }
    }
  }

  function notificacionRecibida(idNotificacion) {
    console.log("*** Marcar notificacion como recibida id: " + idNotificacion + " ***");
    //console.log(angular.toJson(notificacion));
    return Notificacion.recibida({id: idNotificacion}).$promise.then(function (data) {
      console.log(angular.toJson(data));
      //return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al marcar notificacion como recibida ***");
      console.log(angular.toJson(error));
      //return $q.reject(error);
      //return $q.reject((error.data) ? error.data : "Error al marcar notificacion como recibida!");
    }).$promise;
  }

  function notificacionLeida(idNotificacion) {
    console.log("*** Marcar notificacion como leida id: " + idNotificacion + " ***");
    //console.log(angular.toJson(notificacion));
    return Notificacion.leida({id: idNotificacion}).$promise.then(function (data) {
      console.log(angular.toJson(data));
      //return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al marcar notificacion como leida ***");
      console.log(angular.toJson(error));
      //return $q.reject(error);
      //return $q.reject((error.data) ? error.data : "Error al marcar notificacion como leida!");
    }).$promise;
  }

  return {
    procesarNotificacion: procesarNotificacion,
    notificacionRecibida: notificacionRecibida,
    notificacionLeida: notificacionLeida,
    pushNotificationsEnabled: function () {
      return true;
    }
  };

})

.run(function ($rootScope, $cordovaPushV5, BroadcastService, NotificacionService, RegisterService, ConfiguracionService, APP_CONFIG, NOTIFICATION_EVENTS, AUTH_EVENTS) {

  /*$ionicPlatform.ready(configurarNotificaciones);*/
  document.addEventListener("deviceready", configurarNotificaciones, false);
  
  function speak(message) {
    var talk = ConfiguracionService.getTalkEnabled();
    console.log("*** speak: " + message + " - config: "+talk+" ***");
    if (talk === true || talk === "true") {
      TTS.speak({
        text: message,
        locale: 'es-UY',
        rate: 1
      }, function () {
        // pudo hablar
      }, function (reason) {
        // no pudo
      });
    }
  }
  

  function notificacionSuccess(event, notificacion) {
    console.log("*** EVENT HANDLER NotificacionService: " + NOTIFICATION_EVENTS.notificacionRecibida + " ***");
    console.log(angular.toJson(event));
    console.log(angular.toJson(notificacion));

    //Procesar notificacion
    NotificacionService.procesarNotificacion(event, notificacion);

    //Marcar notificacion como recibida
    if (notificacion.additionalData["id-notificacion"]) {
      NotificacionService.notificacionRecibida(notificacion.additionalData["id-notificacion"]);
    }
    
    console.log("---> FOREGROUND "+notificacion.additionalData.foreground+" <---");
    console.log("---> COLDSTART  "+notificacion.additionalData.coldstart+" <---");

    // a ver el estado de la app
    if (notificacion.additionalData.foreground === true) {
      // app en foreground, hablo directamente
      console.log("---> app en foreground, hablo directamente <---");
      speak(notificacion.message);
    } else {
      // la app está en background o cerrada
      if (notificacion.additionalData.coldstart === true) {
        // el sistema tuvo que hacer un start para que pudiera responder la app, 
        // hablo después de unos segundos para evitar superponerme al sonido de la notificación
        console.log("---> hablo después de unos segundos <---");
        setTimeout(function() { speak(notificacion.message); }, 5000);
      } else {
        // es un click a una notificación, no hago nada
      }
    }
    
    if (device && device.platform === "iOS") {
      //if (ionic.Platform.isIOS()) {
      if (notificacion.additionalData.badge) {
        $cordovaPushV5.setBadgeNumber(25).then(function (result) {
          // OK
        }, function (err) {
          // handle error
        });
      }
    }

    $cordovaPushV5.finish().then(function (result) {
      // OK finished - works only with the dev-next version of pushV5.js in ngCordova as of February 8, 2016
    }, function (err) {
      //handle error
    });

  }

  function notificacionError(event, error) {
    console.log("*** EVENT HANDLER NotificacionService: " + NOTIFICATION_EVENTS.notificacionError + " ***");
    console.log(angular.toJson(event));
    console.log(angular.toJson(error));
  }

  function registrarSuccess(result) {
    console.log("*** $cordovaPushV5 registration event - OK ***");
    console.log(angular.toJson(result));
    // que pasa si lo hago siempre? 
    RegisterService.setKeyGCM(result);
//    var oldKey = RegisterService.getKeyGCM();
//    if (result !== oldKey) {
//      //TODO: enviar tambien datos del dispositivo (plataforma, version, etc...)
//      //utilizar "cordova-plugin-device" (ya esta instalado)
//      RegisterService.setKeyGCM(result);
//    }
  }

  function registrarError(error) {
    console.log("*** $cordovaPushV5 registration event - ERROR ***");
    console.log(angular.toJson(error));
  }

  function configurarNotificaciones() {
    console.log("*** configurarNotificaciones ***");
    if (window.PushNotification) {
      // Important to initialize with the multidevice structure
      console.log("*** $cordovaPushV5 - initialize ***");
      $cordovaPushV5.initialize({
        android: {
          senderID: APP_CONFIG.GCMSenderID
        },
        ios: {
          senderID: APP_CONFIG.GCMSenderID,
          gcmSandbox: APP_CONFIG.GCMDevMode
        },
        windows: {}
      }).then(function (resultInit) {
        console.log("*** $cordovaPushV5 initialize - RESULT ***");
        console.log(angular.toJson(resultInit));
        $cordovaPushV5.onNotification(); // No comentar ni borrar linea.
        $cordovaPushV5.onError(); // No comentar ni borrar linea.
        $cordovaPushV5.register().then(registrarSuccess, registrarError);
      });
      //NOTIFICACION RECIVIDA
      BroadcastService.registrar($rootScope, NOTIFICATION_EVENTS.notificacionRecibida, notificacionSuccess);
      //ERROR AL RECIVIR NOTIFICACION
      BroadcastService.registrar($rootScope, NOTIFICATION_EVENTS.notificacionError, notificacionError);
    }
  }

})

.provider('Notificacion', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.notificacion.detalle, {id: '@id'}, {
      get: {
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      all: {
        url: API_URLS.notificacion.listado,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      recibida: {
        url: API_URLS.notificacion.recibida,
        method: 'PUT',
        showGlobalErrors: false,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      leida: {
        url: API_URLS.notificacion.leida,
        method: 'PUT',
        showGlobalErrors: false,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function Notificacion() {

    }

    Notificacion.get = metodos.get;
    Notificacion.all = metodos.all;
    Notificacion.recibida = metodos.recibida;
    Notificacion.leida = metodos.leida;
    return Notificacion;
  };

});