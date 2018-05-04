/*angular.module('starter')

.service('SessionService', function ($q, UsuarioService, AUTH_EVENTS) {

  var initOK = false;
  var usuario = null;

  function init() {
    if (initOK) {
      cargarCredenciales();
    }
    initOK = true;
  }

  function setCredentials() {

  }

  function destroyCredentials() {

  }

  function useCredentials() {

  }

  function loadCredentials(token) {
    if (token) {
      window.localStorage.setItem(STORAGE_API_TOKEN_KEY, token);
      useCredentials(token);
    }
  }

  return {
    init: init
    isLogged: isLogged,
    setCredentials: setCredentials,
    destroyCredentials: destroyCredentials,

  };

})

.run(function (SessionService) {
  SessionService.init();
})

.factory('SessionInterceptor', function ($rootScope, $q, SESSION_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: SESSION_EVENTS.notAuthenticated,
        403: SESSION_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('SessionInterceptor');
});*/