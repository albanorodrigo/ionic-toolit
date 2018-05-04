angular.module('starter')

.service('BroadcastService', function ($rootScope, $timeout) {

  function registrar(scope, eventName, callbackFn) {
    //var handler = $rootScope.$on(eventName, callbackFn);
    var handler = scope.$on(eventName, callbackFn);
    scope.$on('$destroy', handler);
    return handler;
  }

  function broadcast(eventName, eventData) {
    $timeout(function () {
      $rootScope.$emit(eventName, eventData); //Mas preformance (solo se captura en $rootScope)
      //$rootScope.$broadcast(eventName, eventData); //Menos preformance (se captura en todos los $scope)
    });
  }

  return {
    registrar: registrar,
    broadcast: broadcast
  };

});