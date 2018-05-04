angular.module('starter')

.controller('NoconnCtrl', function ($scope, $state, $ionicHistory, $timeout, ConfiguracionService) {

  $scope.reintentar = true;
  $scope.cnt = 10;
  
  $scope.$on('$ionicView.afterEnter', function (e) {
    $scope.reintentar = true;
    $scope.cnt = 10;
    $scope.promiseTimeout = $timeout($scope.reintento, 1000);
  });
  
  $scope.reintento = function() {
    console.log("*** --- NoconnCtrl.reintento en "+$scope.cnt);    
    if ($scope.cnt <= 0) {
      $scope.cnt = 10;
      $scope.conectar();
    } else {
      $scope.cnt--;
      $scope.promiseTimeout = $timeout($scope.reintento, 1000);
    }
  };
  
  $scope.conectar = function () {
    // intenta de vuelta ir a la home
    $scope.reintentar = false;
    $timeout.cancel($scope.promiseTimeout);
    console.log("*** --- NoconnCtrl.conectar");
    $scope.cargarDatosUsuario().then(function (usuario) {
      //El usuario tambien fue cargado, enviar al index state.
      //Redirecionar a pagina de inicio
      var appIndexState = ConfiguracionService.getAppIndexState(); //APP_STATES.home
      $ionicHistory.nextViewOptions({disableBack: true}); //Disable back
      $state.go(appIndexState, {}, {location: "replace", reload: true}); //Redirect
    }, function (error) {
      console.log("*** --- NoconnCtrl.conectar intento fallido! "+JSON.stringify(error));
      //$scope.showAlert("Intento fallido", "No fué posible cargar los datos del usuario");
      $scope.promiseTimeout = $timeout($scope.reintento, 1000);
      // nada
    });
    $scope.reintentar = true;
    console.log("*** --- NoconnCtrl.conectar end");
  };
  
  

});