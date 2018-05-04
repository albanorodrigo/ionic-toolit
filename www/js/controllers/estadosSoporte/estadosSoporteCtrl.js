angular.module('starter')

.controller('EstadosSoporteCtrl', function ($rootScope, $scope, $q, $ionicPopup, $ionicModal, $timeout, BroadcastService, AuthService, SoporteService, FormularioCierreService, FormularioCierreData, UsuarioService, APP_EVENTS, APP_MODULOS, USER_ROLES) {

  $scope.listaSoporteEstados;

  function initDatosController() {
    $scope.listaSoporteEstados = [];
  }

  function cargarDatosController() {
    console.log("*** CARGAR DATOS DE CONTROLLER: EstadosSoporteCtrl ***");
    initDatosController();
    if (AuthService.isAuthenticated()) {
      //Cargar estados de soportes
      cargarEstadosSoporte();
    }
  }

  function cargarEstadosSoporte() {
    $scope.showLoader($scope, "Cargando estados...");
    return SoporteService.cargarEstados().then(function (data) {
      console.log("*** ESTADOS DE SOPORTES ***");
      console.log(data);
      if (data) {
        $scope.listaSoporteEstados = data;
        //Mapear lista con el id del estado
        /*data.forEach(function (item) {
         $scope.listaSoporteEstados[item.idEstadoSoporte] = item;
         });*/
      }
      console.log($scope.listaSoporteEstados);
    }, function (error) {
      //alert("Error al cargar lista de estados del soporte");
    }).finally(function () {
      $scope.hideLoader($scope);
    });
  }

  $scope.getColorEstadoSoporte = function (idEstadoSoporte) {
    if (idEstadoSoporte && $scope.listaSoporteEstados) {
      //var estado = $scope.listaSoporteEstados[idEstadoSoporte];
      var estado = null;
      $scope.listaSoporteEstados.forEach(function (item) {
        if (item.idEstadoSoporte === idEstadoSoporte) {
          estado = item;
          return;
        }
      });
      return (estado) ? estado.color : null;
    }
    return null;
  };

  $timeout(function () {
    cargarDatosController();
  });

});