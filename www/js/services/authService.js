angular.module('starter')

.service('AuthService', function ($q, $http, Auth, BroadcastService, APP_CONFIG, AUTH_EVENTS) {

  var STORAGE_API_TOKEN_KEY = 'auth-api-token'; //Token para servicios de api.

  var initOK = false;
  var isAuthenticated = false;
  var authToken = null;
  
  // agrego a los headers http la version de las api
  $http.defaults.headers.common['X-Api-Version'] = APP_CONFIG.apiVersion;  

  function init() {
    if (!initOK) {
      loadCredentials();
      initOK = true;
    }
  }

  function loadCredentials() {
    console.log("*** CARGAR CREDENCIALES ***");
    var token = window.localStorage.getItem(STORAGE_API_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeCredentials(token) {
    window.localStorage.setItem(STORAGE_API_TOKEN_KEY, token);
    useCredentials(token);
  }

  function useCredentials(token) {
    authToken = token;
    isAuthenticated = true;
    //usuarioRol = USER_ROLES.admin;
    // Set the token as header for your requests!
    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    BroadcastService.broadcast(AUTH_EVENTS.loadCredentials);
  }

  function destroyCredentials() {
    authToken = null;
    isAuthenticated = false;
    //usuarioRol = null;
    delete $http.defaults.headers.common['Authorization'];
    window.localStorage.removeItem(STORAGE_API_TOKEN_KEY);
    BroadcastService.broadcast(AUTH_EVENTS.destroyCredentials);
  }

  function login(username, password, deviceUUID, devicePhoneNumber) {
    console.log("*** Ejecutar login ***");

    //Eliminar credenciales...
    destroyCredentials();

    var sendData = {
      username: username,
      password: password,
      imei: deviceUUID,
      tel: devicePhoneNumber
    };

    return Auth.login(sendData).$promise.then(function (data) {
      console.log("*** login OK ***");
      console.log(data);
      if (data && data.token) {
        //Cargar credenciales
        storeCredentials(data.token);
        BroadcastService.broadcast(AUTH_EVENTS.login);
        return $q.resolve(data.token);
        //Registra el codigo de GCM en el backend
        /*registrarDispositivoGCM();
         //Cargar datos del usuario
         return UsuarioService.cargarUsuario().then(function (usuario) {
         return $q.resolve(usuario);
         }, function () {
         console.log("*** Error al ejecutar login - no se pudo cargar los datos del usuario ***");
         return $q.reject({'mensaje': 'Login ERROR!', 'detalle': 'Error al cargar datos del usuario, intente nuevamente.'});
         });*/
      }
      //RETORNAR ERROR
      console.log("*** Error al ejecutar login - el token es nulo ***");
      return $q.reject({'mensaje': 'Login ERROR!', 'detalle': 'No se pudo obtener el token.'});
    }, function (error) {
      console.log("*** Error al ejecutar login ***");
      console.log(error);
      // el error 410 GONE se usa cuando las api cambian y está gestionado en appCtrl.js
      if (error.status != 410) {
        var mensajeDetalle = (error.statusText) ? error.statusText + ": " : "";
        var reject = {'mensaje': 'Login ERROR!', 'detalle': mensajeDetalle + "Intente nuevamente, mas tarde."};
        if (error.data && error.data.message) {
          reject = {'mensaje': 'Login', 'detalle': error.data.message};
        }
      } else {
        // en este caso como el error es 410 devuelvo un error de versión equivocada
        var reject = {'mensaje': null, 'detalle': null};        
      }
      //RETORNAR ERROR
      return $q.reject(reject);
    });
  }

  function logout() {
    console.log("*** Ejecutar logout ***");
    if (isAuthenticated) {
      Auth.logout({}, function (data) {
        console.log("*** Logout - OK ***");
        BroadcastService.broadcast(AUTH_EVENTS.logout);
      });
    }
    //Importeante ejecutar al final
    destroyCredentials();
  }

  function isAuthorized(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    //return (isAuthenticated && authorizedRoles.indexOf(usuarioRol) !== -1);
    return (isAuthenticated && true); //TODO: validacion de roles...
  }

  return {
    init: init,
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function () {
      return isAuthenticated;
    }
  };

})

.run(function (AuthService) {
  AuthService.init();
})

.provider('Auth', function () {

  this.$get = function ($resource, $httpParamSerializerJQLike, Utilidades, API_URLS) {
    var metodos = $resource(API_URLS.auth.login, {}, {
      login: {
        method: 'POST',
        responseType: "json",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function (data, headers) {
          return $httpParamSerializerJQLike(data);
        },
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {token: aux.body} : aux.body;
          }
          return data;
        }
      },
      logout: {
        url: API_URLS.auth.logout,
        method: 'POST'
      }
    });
    return metodos;
  };

});