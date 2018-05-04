angular.module('starter')

.controller('SoporteNotasCtrl', function ($scope, $state, $stateParams, $timeout, $ionicPopover, $ionicModal, $ionicPopup, $ionicActionSheet, $cordovaCamera, SoporteService) {

  //Carga las notas del soporte
  function cargarNotas(idSoporte) {
    if (idSoporte) {
      $scope.showLoader($scope, "Cargando notas...");
      SoporteService.cargarNotas(idSoporte).then(function (data) {
        $scope.soporteNotas = data;
      }, function (error) {
        console.log(error);
        if (error.message) {
          $scope.showAlert('ERROR', error.message);
        }
      }).finally(function () {
        $scope.hideLoader($scope);
      });
    }
  }

  $timeout(function () {
    //Cargar notas del soporte seleccionado
    cargarNotas($stateParams.soporteId);
  });

});