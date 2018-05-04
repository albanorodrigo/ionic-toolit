// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var appModules = ['ionic', 'ngCordova', 'ngResource', 'chart.js', 'uiGmapgoogle-maps', 'ng-mfb', 'ngLetterAvatar', 'angular.img', 'angular-a-http-dataImage', 'angular-click-outside'];

var appState = {
    takingPicture: false,
    imageUri: ""
};

var app = angular.module('starter', appModules)

.run(function ($rootScope, $ionicPlatform, $timeout, BroadcastService, NETWORK_EVENTS) {

  //console.log("*** PLATFORM: " + ionic.Platform.platform() + " ***");
  //console.log("*** PLATFORM is iOS: " + ionic.Platform.isIOS() + " ***");

  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false); //oculta los accesorios del teclado
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  //Disable BACK button on home
  /*$ionicPlatform.registerBackButtonAction(function (event) {
   if (true) { // your check here
   $ionicPopup.confirm({
   title: 'System warning',
   template: 'are you sure you want to exit?'
   }).then(function (res) {
   if (res) {
   ionic.Platform.exitApp();
   }
   });
   }
   }, 100);*/

  //Indica si la app esta en pausa
  $rootScope.appInPause = false;
  //La aplicacion esta ejecutandose en primer plano
  document.addEventListener("resume", function (resume) {
    console.log("*** Resume de la aplicacion");
    console.log("***" + JSON.stringify(resume));
    $rootScope.appInPause = false;
  }, false);
  //La aplicacion esta en segundo plano (pausada)
  document.addEventListener("pause", function () {
    console.log("*** Pause de la aplicacion");
    $rootScope.appInPause = true;
  }, false);

  // chequea la conexión a internet
  $timeout(function() {
    $rootScope.networkType = navigator.connection.type;
  }, 5000);
//  $rootScope.connectionStates = {};
//  $rootScope.connectionStates[Connection.UNKNOWN]  = 'imposible de identificar';
//  $rootScope.connectionStates[Connection.ETHERNET] = 'muy bueno - LAN (red local)';
//  $rootScope.connectionStates[Connection.WIFI]     = 'muy bueno - WiFi';
//  $rootScope.connectionStates[Connection.CELL_2G]  = '2G';
//  $rootScope.connectionStates[Connection.CELL_3G]  = '3G';
//  $rootScope.connectionStates[Connection.CELL_4G]  = 'muy bueno - 4G';
//  $rootScope.connectionStates[Connection.CELL]     = 'GSM';
//  $rootScope.connectionStates[Connection.NONE]     = 'sin conexión';
    
  document.addEventListener("offline", function() {
    console.log("*** NETWORK OFFLINE *** "+JSON.stringify(navigator.connection));
    // cambió el estado?
    var oldConn = $rootScope.networkType;
    var newConn = navigator.connection.type;
    if (oldConn !== newConn) {
      // actualizo el estado
      $rootScope.networkType = newConn;
      BroadcastService.broadcast(NETWORK_EVENTS.statusChange, newConn);
      // sí, si hay plugin envio notificación
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
        cordova.plugins.notification.local.schedule({
          id: 1,
          title: "Conexión",
          text: "Se perdió la conexión a Internet",
          sound: "file://res/network-status.mp3",
          icon: "res://logo_small",
          smallIcon: "res://logo_small"
        });
      }      
    }
  }, false);
  document.addEventListener("online", function() {
    console.log("*** NETWORK ONLINE *** "+JSON.stringify(navigator.connection));
    // cambió el estado?
    var oldConn = $rootScope.networkType;
    var newConn = navigator.connection.type;
    if (oldConn !== newConn) {
      // actualizo el estado
      $rootScope.networkType = navigator.connection.type;
      BroadcastService.broadcast(NETWORK_EVENTS.statusChange, newConn);
      // sí, si hay plugin y pasamos desde offline a online envio notificación
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification 
              && oldConn === Connection.NONE) {
        cordova.plugins.notification.local.schedule({
          id: 1,
          title: "Conexión",
          text: "La calidad actual de la conexión a Internet es "+newConn,
          sound: "file://res/network-status.mp3",
          icon: "res://logo_small",
          smallIcon: "res://logo_small"
        });        
      }      
    }
  }, false);  
})
.run(function ($rootScope, $state, AuthService, ConfiguracionService, APP_STATES, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
    if (!AuthService.isAuthenticated()) {
      if (next.name !== APP_STATES.login) {
        event.preventDefault();
        $state.go(APP_STATES.login);
      }
    } else {
      if (next.name === APP_STATES.login) {
        event.preventDefault();
        //$state.go("/");
        $state.go(ConfiguracionService.getAppIndexState());
      }
    }
  });
});