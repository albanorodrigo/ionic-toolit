angular.module('starter')

.controller('ConfiguracionCtrl', function ($rootScope, $scope, $timeout, $ionicPopup, $cordovaVibration, $ionicModal, ConfiguracionService, UsuarioService, AuthService, BroadcastService, GeotrackingService, NotificacionService, APP_EVENTS, APP_STATES) {

  $scope.config;
  $scope.listaAppIndexStates;

  function initDatosController() {
    $scope.config = {};
    $scope.listaAppIndexStates = [];
  }

  function cargarDatosController() {
    //Verificar si ya se cargo el usuario...
    UsuarioService.getUsuario().then(function (data) {
      console.log("*** CARGAR DATOS DE CONTROLLER: ConfiguracionCtrl ***");
      console.log(data);
      initDatosController();
      cargarConfiguracion();
      cargarAppStatesDisponibles();
    });
  }

  function registrarEventos() {
    //Se ejecuta cuando se carga el usuario
    BroadcastService.registrar($rootScope, APP_EVENTS.userLogin, function (event, data) {
      cargarDatosController();
    });
  }

  function cargarConfiguracion() {
    $scope.config = {
      apiBaseUrl: ConfiguracionService.getApiBaseUrl(),
      appIndexState: ConfiguracionService.getAppIndexState(),
      menuPrincipalPosicion: ConfiguracionService.getMenuPrincipalPosicion(),
      geoTrackingEnabled: GeotrackingService.backgroundGeoTrackingEnabled(),
      pushNotificationsEnabled: NotificacionService.pushNotificationsEnabled(),
      talkEnabled: ConfiguracionService.getTalkEnabled()
    };
  }

  function cargarAppStatesDisponibles() {
    $scope.listaAppIndexStates.push({'detalle': 'Home', state: APP_STATES.home});
    if ($scope.checkClienteHasModuloSoportes()) {
      $scope.listaAppIndexStates.push({'detalle': 'Soportes', state: APP_STATES.soportes.listado});
    }
    if ($scope.checkClienteHasModuloRutinas()) {
      $scope.listaAppIndexStates.push({'detalle': 'Rutinas', state: APP_STATES.rutinas.listado});
    }
    if ($scope.checkClienteHasModuloMensajes()) {
      $scope.listaAppIndexStates.push({'detalle': 'Mensajes', state: APP_STATES.mensajes.listado});
    }
  }

  $ionicModal.fromTemplateUrl('templates/configuracion/configuracion-index-state.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalAppIndexState = modal;
  });

  $scope.showModalAppIndexState = function () {
    if ($scope.modalAppIndexState) {
      //$scope.listaAppIndexStates = ConfiguracionService.getListaAppIndexStates();
      $scope.modalAppIndexState.show();
    }
  };

  $scope.hideModalAppIndexState = function () {
    if ($scope.modalAppIndexState) {
      $scope.modalAppIndexState.hide();
    }
  };

  $ionicModal.fromTemplateUrl('templates/configuracion/configuracion-menu.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalMenu = modal;
  });

  $scope.showModalMenu = function () {
    if ($scope.modalMenu) {
      $scope.modalMenu.show();
    }
  };

  $scope.hideModalMenu = function () {
    if ($scope.modalMenu) {
      $scope.modalMenu.hide();
    }
  };

  $scope.resetConfiguracion = function () {
    $ionicPopup.confirm({
      title: 'Restablecer configuracion',
      template: '¿Seguro desea restablecer la configuracion?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        //$timeout(function () {
        ConfiguracionService.resetConfiguracion();
        cargarConfiguracion();
        //});
      }
    });
  };

  $scope.guardarApiBaseUrl = function () {
    ConfiguracionService.setApiBaseUrl($scope.config.apiBaseUrl);
  };

  $scope.guardarAppIndexState = function () {
    ConfiguracionService.setAppIndexState($scope.config.appIndexState);
    $scope.hideModalAppIndexState();
    cargarConfiguracion();
  };

  $scope.guardarMenuPrincipalPosicion = function () {
    ConfiguracionService.setMenuPrincipalPosicion($scope.config.menuPrincipalPosicion);
    $scope.hideModalMenu();
    cargarConfiguracion();
  };

  $scope.geoTrackingToggle = function () {
    if ($scope.config.geoTrackingEnabled) {
      GeotrackingService.backgroundGeoTrackingStart();
    } else {
      GeotrackingService.backgroundGeoTrackingStop();
    }
  };

  $scope.pushNotificationsToggle = function () {

  };

  $scope.talkToggle = function () {
    ConfiguracionService.setTalkEnabled($scope.config.talkEnabled);
  };

  $scope.getAppIndexStateDetalle = function (state) {
    if ($scope.listaAppIndexStates && state) {
      for (var i = 0; i < $scope.listaAppIndexStates.length; i++) {
        if ($scope.listaAppIndexStates[i].state === state) {
          return $scope.listaAppIndexStates[i].detalle;
        }
      }
    }
  };

  //Cerrar ventana al salir de la vista...
  $rootScope.$on("$ionicView.beforeLeave", function () {
    $scope.hideModalAppIndexState();
    $scope.hideModalMenu();
  });

  //Destroy controller
  $scope.$on('$destroy', function () {
    if ($scope.modalAppIndexState) {
      $scope.modalAppIndexState.remove();
    }
    if ($scope.modalMenu) {
      $scope.modalMenu.remove();
    }
  });

  $timeout(function () {
    cargarDatosController();
  });
  registrarEventos();


  // -- TEST -- //  
  $scope.vibrate = function () {
    console.log("*** vibrating ***");
    $cordovaVibration.vibrate(1000);
  };

  /*document.addEventListener("deviceready", function () {
   console.log("*** init vibrating ***");
   $cordovaVibration.vibrate(1000);
   $timeout(function () {
   $scope.mostrarNotificacion();
   }, 5000);
   }, false);*/

  $scope.mostrarNotificacion = function () {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
      console.log("*** NOTIFICACION LOCAL - GENERATE!!! ***");
      cordova.plugins.notification.local.schedule({
        id: 1,
        title: "Production Jour fixe",
        text: "Duration 1h",
        //firstAt: monday_9_am,
        //every: "week",
        //sound: "file://sounds/reminder.mp3",
        //icon: "http://icons.com/?cal_id=1",
        //icon: "file://resources/android/icon/drawable-hdpi-icon.png",
        data: {meetingId: "123#fg8"}
      });
      cordova.plugins.notification.local.on("click", function (notification) {
        console.log("*** NOTIFICACION LOCAL - CLICKED ***");
        console.log(angular.toJson(notification));
        //joinMeeting(notification.data.meetingId);
      });
    }
    /*if ($cordovaLocalNotification) {
     console.log("*** NOTIFICACION LOCAL - GENERATE!!! ***");
     $cordovaLocalNotification.schedule({
     id: 1,
     title: 'Title here',
     text: 'Text here',
     data: {
     customProperty: 'custom value'
     }
     }).then(function (result) {
     // ...
     });
     }*/
  };

  /*$rootScope.$on('$cordovaLocalNotification:click', function (event, notification, state) {
   console.log("*** NOTIFICACION LOCAL - CLICKED ***");
   console.log(angular.toJson(notification));
   console.log(angular.toJson(state));
   });*/

  /*var options = {
   title: 'What do you want with this image?',
   buttonLabels: ['Share via Facebook', 'Share via Twitter'],
   addCancelButtonWithLabel: 'Cancel',
   androidEnableCancelButton: true,
   winphoneEnableCancelButton: true,
   addDestructiveButtonWithLabel: 'Delete it'
   };
   
   document.addEventListener("deviceready", function () {
   $cordovaActionSheet.show(options).then(function (btnIndex) {
   var index = btnIndex;
   });
   }, false);
   
   $scope.testShareSheet = function () {
   var options = {
   //'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT, // default is THEME_TRADITIONAL 
   'title': 'What do you want with this image?',
   'buttonLabels': ['Share via Facebook', 'Share via Twitter'],
   'androidEnableCancelButton': true, // default false 
   'winphoneEnableCancelButton': true, // default false 
   'addCancelButtonWithLabel': 'Cancel',
   'addDestructiveButtonWithLabel': 'Delete it',
   'position': [20, 40] // for iPad pass in the [x, y] position of the popover 
   };
   var callback = function (buttonIndex) {
   setTimeout(function () {
   // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1) 
   alert('button index clicked: ' + buttonIndex);
   });
   };
   // Depending on the buttonIndex, you can now call shareViaFacebook or shareViaTwitter 
   // of the SocialSharing plugin (https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin) 
   $cordovaActionSheet.show(options, callback);
   };*/

});

