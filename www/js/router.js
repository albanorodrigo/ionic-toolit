angular.module('starter')

//Configuracion - AngularUI Router
.config(function ($stateProvider, $urlRouterProvider, ConfiguracionServiceProvider, APP_STATES, USER_ROLES) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // TODO: validar que el usuario tenga los modulos habilitados para poder 
  // cargar los contenidos de las paginas
  $stateProvider
  //STATE PRINCIPAL
  .state('app', {
    abstract: true,
    templateUrl: 'templates/main.html'
  })
  //STATE DE LOGIN
  .state(APP_STATES.login, {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  //STATE DE NO CONEXION, cuando es imposible cargar los datos del usuario
  .state(APP_STATES.noconn, {
    url: '/noconn',
    templateUrl: 'templates/noconn.html',
    controller: 'NoconnCtrl'
  })
  //STATE DE MAPA
  .state(APP_STATES.mapa, {
    parent: 'app',
    url: '/mapa',
    cache: false,
    params: {soporte: null},
    views: {
      'main-content': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    }
  })
  //STATE DE MENSAJES
  .state(APP_STATES.mensajes.main, {
    parent: 'app',
    abstract: true,
    views: {
      'main-content': {
        templateUrl: 'templates/mensajes/mensajes.html',
        controller: 'MensajeCtrl'
      }
    }
  })
  .state(APP_STATES.mensajes.listado, {
    parent: APP_STATES.mensajes.main,
    url: '/mensajes',
    templateUrl: 'templates/mensajes/mensajes-listado.html',
    controller: 'MensajeListadoCtrl'
  })
  .state(APP_STATES.mensajes.detalle, {
    parent: APP_STATES.mensajes.main,
    url: '/mensaje/:mensajeId/detalle',
    params: {mensaje: null},
    templateUrl: 'templates/mensajes/mensajes-detalle.html',
    controller: 'MensajeDetalleCtrl'
  })
  //STATES DE SOPORTES
  .state(APP_STATES.soportes.main, {
    parent: 'app',
    abstract: true,
    views: {
      'main-content': {
        templateUrl: 'templates/soportes/soportes.html',
        controller: 'SoporteCtrl'
      }
    }
  })
  .state(APP_STATES.soportes.listado, {
    parent: APP_STATES.soportes.main,
    url: '/soportes',
    templateUrl: 'templates/soportes/soportes-listado.html',
    controller: 'SoporteListadoCtrl'
  })
  .state(APP_STATES.soportes.detalle, {
    parent: APP_STATES.soportes.main,
    url: '/soporte/:soporteId/detalle',
    templateUrl: 'templates/soportes/soportes-detalle.html',
    controller: 'SoporteDetalleCtrl'
  })
  .state(APP_STATES.soportes.fotos, {
    parent: APP_STATES.soportes.main,
    url: '/soporte/:soporteId/fotos',
    templateUrl: 'templates/soportes/soportes-fotos.html',
    controller: 'SoporteFotosCtrl'
  })
  .state(APP_STATES.soportes.notas, {
    parent: APP_STATES.soportes.main,
    url: '/soporte/:soporteId/notas',
    templateUrl: 'templates/soportes/soportes-notas.html',
    controller: 'SoporteNotasCtrl'
  })
  //STATES DE RUTINAS
  .state(APP_STATES.rutinas.main, {
    parent: 'app',
    abstract: true,
    views: {
      'main-content': {
        templateUrl: 'templates/rutinas/rutinas.html',
        controller: 'RutinaCtrl'
      }
    }
  })
  .state(APP_STATES.rutinas.listado, {
    parent: APP_STATES.rutinas.main,
    url: '/rutinas',
    templateUrl: 'templates/rutinas/rutinas-listado.html',
    controller: 'RutinaListadoCtrl'
  })
  //STATES DE ABONADOS
  .state(APP_STATES.abonados.tabs, {
    parent: 'app',
    url: '/abonado/:abonadoId/detalle',
    cache: false,
    params: {lugar: null},
    views: {
      'main-content': {
        templateUrl: 'templates/abonados/abonados-tabs.html',
        controller: 'AbonadoDetalleCtrl'
      }
    }
  })
  // setup an abstract state for the tabs directive
  .state('tabs', {
    parent: 'app',
    abstract: true,
    views: {
      'main-content': {
        templateUrl: 'templates/tabs.html'
      }
    }
  })
  // Each tab has its own nav history stack:
  .state(APP_STATES.home, {
    //parent: 'tabs',
    parent: 'app',
    url: '/home',
    views: {
      //'tab-home': {
      'main-content': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state(APP_STATES.configuracion, {
    //parent: 'tabs',
    parent: 'app',
    url: '/configuracion',
    views: {
      //'tab-configuracion': {
      'main-content': {
        templateUrl: 'templates/configuracion/configuracion.html',
        controller: 'ConfiguracionCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin]
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise(function ($injector) {
    var $state = $injector.get('$state');
    $state.go(ConfiguracionServiceProvider.getAppIndexState());
    //$state.go(APP_STATES.home);
  });
});