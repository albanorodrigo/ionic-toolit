angular.module('starter')

.controller('MensajeDetalleCtrl', function ($scope, $stateParams, $q, $timeout, MensajeService) {

  $scope.mensaje = {};

  //Carga un mensaje para la vista "detalle"
  function cargarDatosMensaje(idMensaje) {
    if (idMensaje) {
      $scope.showLoader($scope, "Cargando mensaje...", "MensajeDetalleCtrl:cargarDatosMensaje");
      return cargarMensaje(idMensaje).then(function (data) {
        if (data) {
          $scope.$on('$ionicView.afterEnter', function () {
            //Se ejecuta luego de cargar la vista y el mensaje
            if (!data.tsNotificacionLeida) {
              //Marcar mensaje como leido
              //mensajeLeido(data);
            }
            //Marcar notificaciones del mensaje como leidas
            //notificacionesLeidas(idMensaje);
          });
        }
      }, function (error) {
        console.log(error);
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
      }).finally(function () {
        $scope.hideLoader($scope, "MensajeDetalleCtrl:cargarDatosMensaje");
      });
    }
    return $q.reject("El id del mensaje a cargar es nulo");
  }

  function cargarMensaje(idMensaje) {
    return MensajeService.cargarMensaje(idMensaje).then(function (data) {
      actualizarMensaje(data);
      return $q.resolve(data);
    }, function (error) {
      return $q.reject(error);
    });
  }

  function actualizarMensaje(mensaje) {
    if (mensaje) {
      //actualiza la propiedad del mensaje actual
      $scope.mensaje = mensaje;
      //actualizar otras propiedades en base al mensaje...
    }
  }

  $scope.getClassMensajeFavoritoIcon = function () {
    if ($scope.mensaje.favorito) {
      return "button-energized ion-ios-star";
    }
    return "button-dark ion-ios-star-outline";
  };

  $scope.marcarFavoritoTest = function () {
    $scope.mensaje.favorito = !($scope.mensaje.favorito);
  };

  $timeout(function () {
    //Cargar mensaje seleccionado
    if ($stateParams.mensaje) {
      actualizarMensaje($stateParams.mensaje);
    } else {
      cargarDatosMensaje($stateParams.mensajeId);
    }
  });

});