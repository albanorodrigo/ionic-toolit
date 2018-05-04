angular.module('starter')

.controller('AbonadoDetalleCtrl', function ($scope, $stateParams, $q, $timeout, AbonadoService) {

  $scope.abonado = {};
  $scope.lugar = null;
  $scope.servicios = [];
  $scope.equipos = [];

  //Carga un abonado para la vista "detalle"
  function cargarDatosAbonado(idAbonado, lugar) {
    if (!idAbonado) {
      return $q.reject("El id del abonado a cargar es nulo");
    }
    $scope.showLoader($scope, "Cargando abonado...", "AbonadoDetalleCtrl:cargarDatosAbonado");
    return cargarAbonado(idAbonado).then(function (data) {
      var idLugar = null;
      if (lugar) {
        idLugar = lugar.idLugar;
        $scope.lugar = lugar;
      }
      //Cargar servicios del abonado
      cargarServiciosAbonado(idAbonado);
      //Cargar equipos del abonado/lugar
      cargarEquiposAbonado(idAbonado, idLugar);
    }, function (error) {
      console.log(error);
      if (error.message) {
        //$scope.showAlert('ERROR', error.message);
      }
    }).finally(function () {
      $scope.hideLoader($scope, "AbonadoDetalleCtrl:cargarDatosAbonado");
    });
  }

  function actualizarAbonado(abonado) {
    if (abonado) {
      //actualiza la propiedad del abonado actual
      $scope.abonado = abonado;
    }
  }

  function cargarAbonado(idAbonado) {
    return AbonadoService.cargarAbonado(idAbonado).then(function (data) {
      actualizarAbonado(data);
      return $q.resolve(data);
    }, function (error) {
      return $q.reject(error);
    });
  }

  function cargarServiciosAbonado(idAbonado) {
    return AbonadoService.cargarServiciosAbonado(idAbonado).then(function (data) {
      $scope.servicios = data;
      return $q.resolve(data);
    }, function (error) {
      return $q.reject(error);
    });
  }

  function cargarEquiposAbonado(idAbonado, idLugar) {
    return AbonadoService.cargarEquiposAbonado(idAbonado, idLugar).then(function (data) {
      $scope.equipos = data;
      return $q.resolve(data);
    }, function (error) {
      return $q.reject(error);
    });
  }

  $timeout(function () {
    //Cargar soporte seleccionado
    cargarDatosAbonado($stateParams.abonadoId, $stateParams.lugar);
  });

});