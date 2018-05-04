angular.module('starter')

.service('GeotrackingService', function ($q, Geotracking) {

  var STORAGE_BACKGROUND_GEOTRACKING_ENABLED_KEY = 'geotracking-background-geotracking-enabled'; //Geotracking habilitado

  var initOK = false;
  var backgroundGeoTracking = null;

  function init() {
    if (!initOK) {
      document.addEventListener("deviceready", configurarBackgroundGeoTracking, false);
      initOK = true;
    }
  }

  function configurarBackgroundGeoTracking() {
    if (window.backgroundGeoLocation) {
      console.log("*** CONFIGURAR plugin backgroundGeoLocation ***");
      var successFn = backgroundGeoTrackingSuccess;
      var errorFn = backgroundGeoTrackingError;
      var options = {
        desiredAccuracy: 0,
        stationaryRadius: 20,
        distanceFilter: 20,
        interval: 60000,
        notificationTitle: "Tecytal GeoTracking",
        notificationText: "ACTIVO",
        //locationProvider: window.backgroundGeoLocation.provider.ANDROID_DISTANCE_FILTER_PROVIDER, 
        locationProvider: window.backgroundGeoLocation.provider.ANDROID_ACTIVITY_PROVIDER,
        fastestInterval: 5000,
        activitiesInterval: 10000,        
        pauseLocationUpdates: false,
        stopOnStillActivity:true,
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle. 
        stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates 
      };
      backgroundGeoTracking = window.backgroundGeoLocation;
      backgroundGeoTracking.configure(successFn, errorFn, options);
    }
  }

  function backgroundGeoTrackingEnabled() {
    console.log("*** [js] BackgroundGeoLocation CHECK IS ACTIVE ***");
    var retorno = window.localStorage.getItem(STORAGE_BACKGROUND_GEOTRACKING_ENABLED_KEY);
    console.log(retorno);
    return ((retorno === "true"));
    /*return $q(function (resolve, reject) {
     console.log("*** [js] BackgroundGeoLocation CHECK IS ACTIVE ***");
     if (window.plugins && window.plugins.backgroundGeoLocation) {
     backgroundGeoLocation.isLocationEnabled(function (data) {
     console.log("*** [js] BackgroundGeoLocation CHECK IS ACTIVE - OK ***");
     console.log(angular.toJson(data));
     resolve(data);
     }, function (error) {
     console.log("*** [js] BackgroundGeoLocation CHECK IS ACTIVE - ERROR ***");
     console.log(angular.toJson(error));
     reject(error);
     });
     }
     resolve(false);
     });*/
  }

  function backgroundGeoTrackingStart() {
    if (backgroundGeoTracking) {
      console.log("*** backgroundTracking - START OK ***");
      backgroundGeoTracking.stop();
      backgroundGeoTracking.start();
      window.localStorage.setItem(STORAGE_BACKGROUND_GEOTRACKING_ENABLED_KEY, true);
    } else {
      console.log("*** backgroundTracking - START ERROR ***");
    }
  }

  function backgroundGeoTrackingStop() {
    if (backgroundGeoTracking) {
      backgroundGeoTracking.start();
      backgroundGeoTracking.stop(function () {
        console.log("*** backgroundTracking - STOP OK ***");
        window.localStorage.setItem(STORAGE_BACKGROUND_GEOTRACKING_ENABLED_KEY, false);
      });
    } else {
      console.log("*** backgroundTracking - STOP ERROR ***");
    }
  }

  function backgroundGeoTrackingSuccess(location) {
    console.log("*** [js] BackgroundGeoLocation \"backgroundTrackingSuccess\" ***");
    console.log(angular.toJson(location));
    /*locationExample:
     time: 1461339290000,
     speed: 0.6820621490478516,
     altitude: 112.55610139602797,
     bearing: 209.68463134765625,
     longitude: -56.1480117684987,
     latitude: -34.889318971834385,
     debug: true,
     accuracy: 15,
     serviceProvider: "ANDROID_DISTANCE_FILTER"
     */
    var dataSend = {
      accuracy: location.accuracy,
      altitude: location.altitude,
      altitudeAccuracy: location.altitudeAccuracy,
      heading: location.heading,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      timestamp: location.time
    };
    // Do your HTTP request here to POST location to your server.
    enviarPosicion(dataSend).then(function (data) {
      console.log("*** [js] BackgroundGeoLocation \"enviarPosicion\" - OK ***");
      console.log(angular.toJson(data));
    }, function (error) {
      console.log("*** [js] BackgroundGeoLocation \"enviarPosicion\" - ERROR ***");
      console.log(angular.toJson(error));
    });
    /*
     IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
     and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
     IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
     */
    backgroundGeoTracking.finish();
  }

  function backgroundGeoTrackingError(error) {
    console.log('*** BackgroundGeoLocation \"backgroundTrackingError\" ***');
    console.log(angular.toJson(error));
  }

  function enviarPosicion(posicion) {
    console.log("*** Guardar posicion en el backend ***");
    return $q(function (resolve, reject) {
      if (posicion) {
        var timestamp = moment().format("YYYY-MM-DD[T]HH:mm:ss");
        if (posicion.timestamp) {
          var tsParse = moment(posicion.timestamp, "x");
          if (tsParse) {
            timestamp = tsParse.format("YYYY-MM-DD[T]HH:mm:ss");
          }
        }
        var dataSend = {
          accuracy: posicion.accuracy,
          altitude: posicion.altitude,
          altitudeAccuracy: posicion.altitudeAccuracy,
          heading: posicion.heading,
          latitude: posicion.latitude,
          longitude: posicion.longitude,
          speed: posicion.speed,
          timestamp: timestamp
        };
        Geotracking.enviar(dataSend, function (data) {
          console.log("*** Guardar posicion en el backend - OK ***");
          console.log(data);
          resolve(data);
        }, function (error) {
          console.log("*** Guardar posicion en el backend - ERROR ***");
          console.log(error);
          reject(error);
        }).$promise;
      } else {
        console.log("*** Error al guardar posicion en el backend - la \"posicion\" es nula ***");
        reject("Error al guardar posicion en el backend - la \"posicion\" es nula");
      }
    });
  }

  function obtenerPosicion(id) {
    console.log("*** Obtener pocicion id: " + id + " desde el backend ***");
    return Geotracking.get({id: id}, function (data) {
      console.log("*** Obtener pocicion id: " + id + " desde el backend - OK ***");
      console.log(data);
    }, function (error) {
      console.log("*** Obtener pocicion id: " + id + " desde el backend - ERROR ***");
      console.log(error);
    }).$promise;
  }

  return {
    init: init,
    backgroundGeoTrackingStart: backgroundGeoTrackingStart,
    backgroundGeoTrackingStop: backgroundGeoTrackingStop,
    backgroundGeoTrackingEnabled: backgroundGeoTrackingEnabled,
    enviarPosicion: enviarPosicion,
    obtenerPosicion: obtenerPosicion
  };
})

.provider('Geotracking', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {
    var metodos = $resource(API_URLS.geotracking.enviar, {}, {
      enviar: {
        method: 'POST',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      get: {
        method: 'GET',
        url: API_URLS.geotracking.enviar,
        params: {id: '@id'},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });
    return metodos;
  };

})

.run(function (GeotrackingService) {

  GeotrackingService.init();

});