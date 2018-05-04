angular.module('starter')

.controller('MensajeCtrl', function ($scope, $q, $ionicPopup) {

  function eliminarMensaje(mensaje) {
    /*$scope.showLoader($scope, "Rechazando soporte...");
     return SoporteService.rechazarSoporte(soporte).then(function (data) {
     return $q.resolve(data);
     }, function (error) {
     return $q.reject(error);
     }).finally(function () {
     $scope.hideLoader($scope);
     });*/
  }

  function marcarFavorito(mensaje) {
    /*$scope.showLoader($scope, "Rechazando soporte...");
     return SoporteService.rechazarSoporte(soporte).then(function (data) {
     return $q.resolve(data);
     }, function (error) {
     return $q.reject(error);
     }).finally(function () {
     $scope.hideLoader($scope);
     });*/
  }

  $scope.eliminarMensaje = function (mensaje) {
    return $ionicPopup.confirm({
      title: 'Eliminar mensaje',
      template: '¿Seguro desea eliminar el mensaje?',
      okText: 'Si',
      okType: 'button-assertive',
      cancelText: 'Cancelar',
      cancelType: 'button-positive'
    }).then(function (isOK) {
      if (isOK) {
        eliminarMensaje(mensaje);
      }
    });
  };

  $scope.marcarFavorito = function (mensaje) {
    marcarFavorito(mensaje);
    return $q.resolve(true);
  };

});