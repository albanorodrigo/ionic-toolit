angular.module('starter')

.controller('MensajeListadoCtrl', function ($rootScope, $scope, $timeout, $ionicListDelegate, MensajeService, BroadcastService, APP_EVENTS) {

  $scope.listaMensajes;

  $scope.mostrarNotificacionesSinRemitente;

  function initDatosController() {
    $scope.listaMensajes = [];
    $scope.mostrarNotificacionesSinRemitente = false;
  }

  function cargarDatosController() {
    console.log("*** CARGAR DATOS DE CONTROLLER: SoporteListadoCtrl ***");
    initDatosController();
    cargarMensajes(true, false);
  }

  function registrarEventos() {
    //Se ejecuta cuando se informa de un nuevo mensaje
    BroadcastService.registrar($rootScope, APP_EVENTS.soporte.nuevo, function (event, data) {
      //$scope.listaSoportes = MensajeService.getMensajes();
    });
    //Se ejecuta cuando se carga el usuario
    BroadcastService.registrar($rootScope, APP_EVENTS.userLogin, function (event, data) {
      cargarDatosController();
    });
  }

  function cargarMensajes(mostrarLoader, isPullToRefresh) {
    if (mostrarLoader) {
      $scope.showLoader($scope, "Cargando mensajes...");
    }
    $timeout(function () {
      MensajeService.cargarMensajes().then(function (data) {
        $scope.listaMensajes = data;
      }, function (error) {
        console.log("*** MensajeListadoCtrl: Error al cargar mensajes ***");
        console.log(error);
        //alert("Error al cargar lista de soportes");
      }).finally(function () {
        if (mostrarLoader) {
          $scope.hideLoader($scope);
        }
        if (isPullToRefresh) {
          $scope.$broadcast('scroll.refreshComplete');
        }
      });
    }, (isPullToRefresh) ? 1500 : false); //fix ionic loader refresh
  }

  $scope.$on("$ionicView.leave", function () {
    $scope.closeListOptionButtons();
  });

  $scope.pullToRefresh = function () {
    cargarMensajes(false, true);
  };

  $scope.getMensajeIconClass = function (mensaje) {
    if (mensaje) {
      if (mensaje.cerrado) {
        return "icon icon-small ion-locked assertive";
      } else if (!mensaje.idUsuarioAsignado) {
        return "icon icon-small ion-ios-briefcase positive";
      } else if (mensaje.tsInicio && !soporte.cerrado) {
        return "icon icon-medium ion-ios-play balanced";
      } else if (!mensaje.tsNotificacionLeida) {
        return "icon icon-medium ion-ios-flag positive";
      }
    }
    return "";
  };
  
  $scope.filtroMensajes = function(mensaje) {
    // si mostrarNotificacionesSinRemitente devuelve siempre true, 
    // si no va en or con el segundo test y no muestra los mensajes que no
    // tienen remitente
    return $scope.mostrarNotificacionesSinRemitente || (mensaje.idUsuarioRemitente !== null);
  };

  $scope.closeListOptionButtons = function () {
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.eliminar = function (mensaje) {
    $scope.eliminarMensaje(mensaje).finally(function () {
      $scope.closeListOptionButtons();
    });
  };

  $scope.favorito = function (mensaje) {
    $scope.marcarFavorito(mensaje).finally(function () {
      $scope.closeListOptionButtons();
    });
  };

  $scope.nuevoMensaje = function () {
    console.log("*** Redactar nuevo mensaje ***");
  };

  $timeout(function () {
    cargarDatosController();
  });
  registrarEventos();

});