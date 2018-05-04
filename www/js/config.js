angular.module('starter')

//Configuracion - HTTPProvider
.config(function ($httpProvider) {
  //Mostrar errores globales por defecto
  $httpProvider.defaults.showGlobalErrors = true;
  //Auth interceptor/General errors interceptor...
  $httpProvider.interceptors.push(function ($rootScope, $q, APP_EVENTS, AUTH_EVENTS) {
    return {
      request: function (config) {
        if (config) {
          config.timeout = 25000; //Setea un timeout de 25 seg. en las peticiones
          config.startTime = new Date().getTime(); //Setea el comienzo de la peticion
          config.showGlobalErrors = $httpProvider.defaults.showGlobalErrors; //Parametro para mostrar errores globales
        }
        return config;
      },
      response(res) {
        //Encender errores globales
        $httpProvider.defaults.showGlobalErrors = true;
        return res;
      },
      responseError: function (rejection) {
        console.log("*** rejection response: ***");
        console.log(JSON.stringify(rejection));
        //Errores generales, timeout, etc..
        if (rejection && rejection.status) {
          switch (rejection.status) {
            case 408 :
              console.log('server return status 408 - connection timed out');
              break;
          }
          //Se evalua si la peticion excedio el tiempo de timeout definido
          if (rejection.config && rejection.config.startTime && rejection.config.timeout) {
            var respTime = new Date().getTime() - rejection.config.startTime;
            if (respTime >= rejection.config.timeout) {
              alert("Timeout error: el servidor no responde.");
            }
          }
        }

        //Eventos de autenticación
        var authError = {
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized
        }[rejection.status];
        var errorEvent = (authError) ? authError : APP_EVENTS.httpRequestError;
        //Disparar evento de autenticacion
        $rootScope.$broadcast(errorEvent, rejection);

        //Retornar rejection
        return $q.reject(rejection);
      }
    };
  });
})
//Configuracion - APP
.config(function ($ionicConfigProvider) {
  //Ionic config
  //$ionicConfigProvider.views.maxCache(0);
  //$ionicConfigProvider.backButton.text('Volver');
  $ionicConfigProvider.backButton.text('');
  //Moment js locale
  moment.locale("es");
})
//Configuracion - GOOGLE MAPS
.config(function (uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: "AIzaSyAGqIyN1mFgDAj54bATxZUmFJIZUhbycUY",
    language: "es",
    //libraries: "weather,geometry,visualization",
    //v: "3.20",
    //sensor: "false"
  });
})
//Configuracion - Chartsjs
.config(function (ChartJsProvider) {
  //ChartJsProvider.setOptions({colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']});
});