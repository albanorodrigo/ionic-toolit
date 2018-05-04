angular.module('starter')

.controller('AppCtrl', function ($rootScope, $scope, $state, $q, $timeout, $ionicLoading, $ionicModal, $ionicPopup, $ionicHistory, $ionicListDelegate, UsuarioService, ConfiguracionService, AuthService, BroadcastService, DeviceService, APP_CONFIG, URLS, APP_STATES, APP_EVENTS, AUTH_EVENTS, NETWORK_EVENTS, APP_MODULOS, USER_ROLES) {

  $scope.APP_CONFIG = APP_CONFIG;
  $scope.URLS = URLS;

  $scope.loaderTasks = [];
  $scope.loaderStatus = "Cargando...";

  $scope.debugHtml = "";
  $scope.menu = {};
  
  $scope.networkStatus = "?";
  $scope.networkStatusIcon = "";
  
  $scope.mensaje = { texto: "", show: false };

  $scope.usuario = {};
  $scope.usuarioEstado = {};
  $scope.usuarioEstadoSelect = {value: null};
  $scope.clienteModulos = {};
  $scope.listaUsuarioEstados = [];
  
  $scope.progressBar = {active:false, value:0};
  
  $scope.lastHttpError = 0;

  //Inicializacion de la App (cargar datos, etc..)
  function cargarDatosController() {
    console.log("*** CARGAR DATOS DE CONTROLLER: AppCtrl ***");
    //Cargar menu
    cargarDatosMenu();
    //
    console.log("*** LLAMANDO cargarDatosUsuario ***");
    //Cargar datos de usuario logeado
    cargarDatosUsuario().then(
    function (value) {
      console.log("*** cargarDatosUsuario: OK ***");
      console.log(value);
    }, 
    function (error) {
      console.log("*** cargarDatosUsuario: ERROR ***");
      console.log(JSON.stringify(error));
      //Si no puedo cargar el usuario ir al login
      $scope.noconn();
    });    
    
    //Disparar evento de "Aplicacion inicializada..."
    BroadcastService.broadcast(APP_EVENTS.init);
  }

  function registrarEventos() {
    //Registrar eventos del controlador
    BroadcastService.registrar($rootScope, APP_EVENTS.menu.badgesRefresh, function (event, badgeEvent) {
      console.log("*** EVENT HANDLER AppCtrl: recargar badges menu!!! ***");
      console.log(badgeEvent);
      if (badgeEvent && badgeEvent.badgeType) {
        $scope.menu.badges[badgeEvent.badgeType] = badgeEvent.number;
      }
    });
    BroadcastService.registrar($scope, AUTH_EVENTS.notAuthenticated, function (event, data) {
      console.log("*** EVENT HANDLER AppCtrl: AUTH_EVENTS.notAuthenticated!!! ***");
      var showError = ('showGlobalErrors' in data.config) ? data.config.showGlobalErrors : true;
      if (AuthService.isAuthenticated() && showError) {
        $scope.showAlert('Su sesión expiro!', 'Disculpe, debe iniciar sesion nuevamente.');
      }
      $scope.logout();
      event.preventDefault();
    });
    BroadcastService.registrar($scope, AUTH_EVENTS.notAuthorized, function (event, data) {
      console.log("*** EVENT HANDLER AppCtrl: AUTH_EVENTS.notAuthorized!!! ***");
      var showError = ('showGlobalErrors' in data.config) ? data.config.showGlobalErrors : true;
      if (AuthService.isAuthenticated() && showError) {
        $scope.showAlert('Permiso denegado!', 'No se le permite acceder a este recurso.');
      }
    });
    BroadcastService.registrar($scope, APP_EVENTS.httpRequestError, function (event, data) {
      console.log("*** EVENT HANDLER AppCtrl: APP_EVENTS.httpRequestError!!! ***");
      console.log("    Event: ", event);
      console.log("    Data: ", data);
      if (data && data.config) {
        // si el error es de tipo 410 GONE quiere decir que las api no están disponibles,
        // entonces visualizo un error, informo el usuario y salgo
        if (data.status == 410) {
          $scope.showAlert('VERSION INCORRECTA', 
          "La versión de esta aplicación y la versión del servidor no coinciden.<br/>"+
          "Por favor instale la versión actualizada.");
          event.preventDefault();
        } else {
          // si tiene que mostrar el error lo hace
          var showError = ('showGlobalErrors' in data.config) ? data.config.showGlobalErrors : true;
          if (showError && (Date.now() - $scope.lastHttpError) > 4000) {
            var mensaje = "Ocurrio un error al cargar los datos";
            if (data.data && data.data.message) {
              mensaje = data.data.message;
            } else if (data.statusText) {
              mensaje = data.statusText;
            }
            if (data.config.url) {
              var ref = data.config.url.split("/").pop();
              mensaje += "\n (ref: \""+ref+"\")";
            }
            //$scope.showAlert('ERROR!', mensaje);
            $scope.showMensaje(mensaje);
            $scope.lastHttpError = Date.now();
            event.preventDefault();
          }           
        }
      }
    });
    BroadcastService.registrar($rootScope, APP_EVENTS.goToState, function (event, stateData) {
      console.log("*** EVENT HANDLER AppCtrl: GO TO STATE -> \"" + stateData + "\" ***");
      if (stateData && stateData.name) {
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go(stateData.name, stateData.params, {location: "replace", reload: false});
      }
    });
    BroadcastService.registrar($rootScope, APP_EVENTS.debugRefresh, function (event, data) {
      console.log("*** EVENT HANDLER AppCtrl: DEBUG REFRESH ***");
      $scope.debugHtml = data;
    });
    BroadcastService.registrar($rootScope, NETWORK_EVENTS.statusChange, function (event, data) {
      console.log("*** EVENT HANDLER AppCtrl: NETWORK_EVENTS.statusChange ***");
      $scope.networkStatus = data;
      switch (data) {
        case Connection.UNKNOWN:
          $scope.networkStatus = "#f00";
          break;
        case Connection.ETHERNET:
        case Connection.WIFI:
        case Connection.CELL_4G:
          $scope.networkStatus = "#0f0";
          break;
        case Connection.CELL_2G:
        case Connection.CELL_3G:
          $scope.networkStatus = "#ff0";
          $scope.networkStatus = "#0f0";
          break;
        case Connection.CELL:
        case Connection.NONE:
          $scope.networkStatus = "#f00";
          break;
        default:
          $scope.networkStatus = "transparent";
          break;
      }
    });
  }

  //Inicializa el menu de la app de manera dinamica
  function cargarDatosMenu() {
    $scope.menu = {
      badges: {},
      posicion: "left" //TODO: ConfiguracionService.getMenuPrincipalPosicion()
    };
    //Load badges menu (indica a los servicios que cargen el badge)
    //$rootScope.$broadcast(APP_EVENTS.menu.badgesLoad);
  }

  //Carga los datos del usuario loggeado
  function cargarDatosUsuario() {
    var defer = $q.defer();
    var promise = defer.promise;
    if (AuthService.isAuthenticated()) {
      $scope.showLoader($scope, "Cargando sus datos...");
      UsuarioService.cargarUsuario().then(function (data) {
        console.log("*** Datos del usuario logeado ***");
        console.log(data);
        if (data && data.usuario) {
          $scope.usuario = data.usuario;
          UsuarioService.getModulosCliente().then(function (data) {
            console.log("**** MODULOS Y CONFIGURACION DEL CLIENTE - OK ****");
            console.log(data);
            $scope.clienteModulos = data;
          });
          UsuarioService.cargarEstadoUsuario($scope.usuario).then(function (data) {
            $scope.usuarioEstado = data;
            $scope.usuarioEstadoSelect = {value: data.idEstadoUsuario};
            console.log("*** USUARIO ESTADO ACTUAL - OK ***");
            console.log(data);
          }, function (error) {
            console.log("*** USUARIO ESTADO ACTUAL - ERROR ***");
            console.log(error);
          });
          defer.resolve(data.usuario);
          //Informo con un evento de la app que el usuario fue cargado
          BroadcastService.broadcast(APP_EVENTS.userLoaded, data);
        }
        defer.reject({mensaje: 'ERROR!', detalle: 'Ocurrio un error al cargar sus datos'});
      }, function (error) {
        //alert("Error al cargar datos del usuario.");
        //$scope.hideLoader($scope);
        defer.reject(error);
      });
      //Cargar lista de estados
      UsuarioService.cargarEstados().then(function (estados) {
        $scope.listaUsuarioEstados = (estados) ? estados : $scope.usuarioEstados;
      });
    }
    promise.finally(function () {
      console.log("*** CARGAR DATOS USUARIO (promise) - FINALLY ***");
      $scope.hideLoader($scope);
    });
    return promise;
  }

  $scope.cargarDatosUsuario = function () {
    return cargarDatosUsuario();
  };

  $scope.checkUserHasRol = function (userRoles) {
    //Verifica si el usuario contiene al menos un rol
    //de los indicados en la lista "userRoles"
    if (angular.isArray($scope.usuario.roles)) {
      if (angular.isArray(userRoles)) {
        var userRolOK = false;
        userRoles.forEach(function (rol) {
          if ($scope.usuario.roles.indexOf(rol) !== -1) {
            userRolOK = true;
          }
        });
        return userRolOK;
      }
    }
    return false;
  };

  $scope.checkUserHasAllRoles = function (userRoles) {
    //Verifica si el usuario contiene todos los roles
    //de los indicados en la lista "userRoles"
    if (angular.isArray($scope.usuario.roles)) {
      if (angular.isArray(userRoles)) {
        var userRolesOK = 0;
        userRoles.forEach(function (rol) {
          if ($scope.usuario.roles.indexOf(rol) !== -1) {
            userRolesOK++;
          }
        });
        return (userRolesOK === userRoles.length);
      }
    }
    return false;
  };

  //TODO: mover a AppModuloCtrl.js
  $scope.getModuloCliente = function (moduloID) {
    return $scope.clienteModulos[moduloID];
  };

  $scope.getModuloClienteConfig = function (moduloID) {
    var modulo = $scope.getModuloCliente(moduloID);
    if (modulo) {
      return modulo['config'];
    }
    return null;
  };

  $scope.getModuloClienteConfigValue = function (moduloID, configValueID) {
    var configModulo = $scope.getModuloClienteConfig(moduloID);
    if (configModulo) {
      return configModulo[configValueID];
    }
    return null;
  };

  $scope.checkClienteHasModuloSoportes = function () {
    return ($scope.getModuloCliente(APP_MODULOS.soportes.id));
  };

  $scope.checkSupervisionSoportes = function () {
    if ($scope.checkClienteHasModuloSoportes()) {
      return ($scope.checkUserHasRol([USER_ROLES.admin, USER_ROLES.supervisor]));
    } else {
      return false;
    }
  };

  $scope.checkClienteHasModuloRutinas = function () {
    return ($scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.rutinas));
  };

  $scope.checkClienteHasModuloMensajes = function () {
    return ($scope.getModuloCliente(APP_MODULOS.mensajes.id));
  };

  $scope.checkShowCampo = function (camposOcultos, campoID) {
    if (camposOcultos && campoID) {
      if (!angular.isArray(camposOcultos)) {
        camposOcultos = camposOcultos.replace(/\s/g, "");
        camposOcultos = camposOcultos.split(",");
      }
      return (camposOcultos.indexOf(campoID) === -1);
    }
    return true;
  };

  //TODO: mover a SoporteCtrl????
  $scope.checkShowSoporteCampo = function (campoID) {
    var camposOcultos = $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.ocultarCampos);
    return $scope.checkShowCampo(camposOcultos, campoID);
  };

  $scope.cambiarEstadoUsuario = function () {
    //$timeout(function () {
    if ($scope.usuario) {
      var idEstado = $scope.usuarioEstadoSelect.value;
      $scope.showLoader($scope, "Cambiando estado...");
      console.log("*** ASIGNAR ESTADO USUARIO: ****");
      console.log($scope.usuarioEstadoSelect);
      UsuarioService.cambiarEstadoUsuario($scope.usuario, idEstado).then(function (data) {
        if (data) {
          //Asignar estado actual
          $scope.usuarioEstado = data;
          $scope.usuarioEstadoSelect = {value: data.idEstadoUsuario};
        }
        $scope.hideModalEstadoUsuario();
      }, function (error) {
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
        $scope.usuarioEstadoSelect = {value: $scope.usuarioEstado.idEstadoUsuario};
      }).finally(function () {
        $scope.hideLoader($scope);
      });
    }
    //});
  };

  $scope.estadoUsuarioColorClass = function () {
    if ($scope.usuarioEstado && $scope.usuarioEstado.estado) {
      var estadoActual = $scope.usuarioEstado.estado.toLowerCase();
      if (estadoActual === "disponible") {
        return "balanced";
      } else if (estadoActual === "no disponible") {
        return "assertive";
      } else if (estadoActual === "ocupado") {
        return "energized";
      } else if (estadoActual === "en descanso") {
        return "energized";
      }
    }
    return "positive";
  };

  $scope.logout = function () {
    AuthService.logout();
    //Redirect to login
    $state.go(APP_STATES.login, {}, {reload: true}).then(function () {
      $ionicHistory.clearHistory(); //Limpiar historial de navegacion
      $ionicHistory.clearCache(); //Limpiar cache de navegacion
      //$ionicHistory.nextViewOptions({disableBack: true}); //Disable back
    });
  };

  $scope.noconn = function () {
    //Redirect alla pagina de error de conexión
    $state.go(APP_STATES.noconn, {}, {location: "replace", reload: true}).then(function () {
      $ionicHistory.clearHistory(); //Limpiar historial de navegacion
      $ionicHistory.clearCache(); //Limpiar cache de navegacion
      //$ionicHistory.nextViewOptions({disableBack: true}); //Disable back
    });
  };

  // Crea la ventana modal para cambiar el estado del usuario
  $ionicModal.fromTemplateUrl('templates/usuario-estado.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalEstadoUsuario = modal;
  });

  $scope.showModalEstadoUsuario = function () {
    if ($scope.modalEstadoUsuario) {
      $scope.modalEstadoUsuario.show();
    }
  };

  $scope.hideModalEstadoUsuario = function () {
    if ($scope.modalEstadoUsuario) {
      $scope.modalEstadoUsuario.hide();
    }
  };

  //Crear modal para pantalla de debug
  $ionicModal.fromTemplateUrl('templates/debug.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalDebug = modal;
  });

  $scope.showModalDebug = function () {
    //IMPORTANTE: "APP_CONFIG.devMode" impide que la ventana 
    //de debug se muestre en la version de produccion
    if ($scope.modalDebug && APP_CONFIG.devMode) {
      $scope.modalDebug.show();
    }
  };

  $scope.hideModalDebug = function () {
    if ($scope.modalDebug) {
      $scope.modalDebug.hide();
    }
  };

  $scope.showAlert = function (title, template) {
    return $ionicPopup.alert({
      title: title,
      template: template
    });
  };

  $scope.showProgress = function (progress) {
    $scope.progressBar.value = Math.round(progress);
    // no testeo si el valor es 100 por que hay un delay entre el envio total del file 
    // y la llamada a la funcion de upload terminado
    $scope.progressBar.active = ($scope.progressBar.value > 0); //&& ($scope.progressBar.value < 100);
  };

  $scope.hideProgress = function () {
    $scope.progressBar.active = false;
    $scope.progressBar.value = 0;
  };

  $scope.showMensaje = function (mensaje) {
    $scope.mensaje.texto = mensaje;
    $scope.mensaje.show = true;
    $timeout($scope.hideMensaje, 8000);
  };

  $scope.hideMensaje = function () {
    $scope.mensaje.show = false;
  };

  $scope.showLoader = function (scope, text, id) {
    $timeout(function () {
      if ($scope.loaderTasks && scope && scope.$id) {
        text = (text) ? text : "Cargando...";
        id = (id) ? id : scope.$id;
        if ($scope.loaderTasks.length <= 0) {
          $scope.loaderStatus = text;
        }
        var existe = false;
        for (var i = 0; i < $scope.loaderTasks.length; i++) {
          var item = $scope.loaderTasks[i];
          if (item && item.id === id) {
            existe = true;
            $scope.loaderTasks[i].text = text;
            break;
          }
        }
        if (existe === false) {
          //Mostrar loader...
          $ionicLoading.show({
            scope: $scope,
            noBackdrop: false,
            hideOnStateChange: true,
            template: '<ion-spinner icon="ios"></ion-spinner><div>{{loaderStatus}}</div>',
          });
          //Descomentar linea si se agrega unicamente si no existe
          //$scope.loaderTasks.push({id: id, text: text});
        }
        //Comentar linea si se agrega unicamente si no existe
        $scope.loaderTasks.push({id: id, text: text});
        //Update loader text
        $scope.loaderStatus = ($scope.loaderTasks[0]) ? $scope.loaderTasks[0].text : $scope.loaderStatus;
      }
    });
  };

  $scope.hideLoader = function (scope, id, forceHide) {
    //console.log($ionicLoading);
    //var e = angular.element(document.querySelector('#id'));
    $timeout(function () {
      if (scope && scope.$id) {
        id = (id) ? id : scope.$id;
        for (var i = 0; i < $scope.loaderTasks.length; i++) {
          var item = $scope.loaderTasks[i];
          if (item && item.id === id) {
            $scope.loaderTasks.splice(i, 1);
          }
        }
        //Update loader text
        $scope.loaderStatus = ($scope.loaderTasks[0]) ? $scope.loaderTasks[0].text : $scope.loaderStatus;
      }
      if (forceHide || ($scope.loaderTasks && $scope.loaderTasks.length <= 0)) {
        //Ocultar loader...
        $ionicLoading.hide();
      }
    });
  };

  //Limpia todos los datos almacenados de la app
  $scope.clearLocalStorage = function () {
    console.log("*** appCtrl: \"clearLocalStorage\" CALLED!!! ***");
    $ionicPopup.confirm({
      title: 'Limpiar datos',
      template: '¿Seguro desea limpiar la base de datos local?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        window.localStorage.clear();
      }
    });
  };

  //Genera un UUID random con fines de testing
  //IMPORTANTE: que no se pueda generar en produccion
  $scope.generarEmulatedUUID = function () {
    console.log("*** appCtrl: \"generarEmulatedUUID\" CALLED!!! ***");
    $ionicPopup.confirm({
      title: 'Generar UUID emulado',
      template: '¿Seguro desea generar el UUID emulado?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        DeviceService.generateEmulatedUUID();
      }
    });
  };

  $scope.closeListOptionButtons = function () {
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.testclick = function () {
    //...
  };

  cargarDatosController();
  registrarEventos();

});