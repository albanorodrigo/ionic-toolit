angular.module('starter')

.constant('CONSTANTES', {
  tsDateTimeFormat: "DD/MM/YYYY HH:mm",
  tsDateFormat: "DD/MM/YYYY",
  tsTimeFormat: "HH:mm"
})

// todo lo que está entre las lineas de comentario con los tags "replace" y "/replace" 
// se cambia por el contenido de otro file (que tiene los url de producción o testing) 
// gracias al gulpfile.js
//<replace>
// *** TESTING ***
.constant('URLS',{
  baseUrl: "https://dev.tecytal.com",
  defaultUrl: "https://dev.tecytal.com",
  defaultApiBaseUrl: "https://dev.tecytal.com/rest"
})
.constant('APP_CONFIG', {
  devMode: true, //activa-desactiva las funcionalidades de desarrollo (IMPORTANTE poner en "false" en prod.)
  cambiarApi: true, // permite cambiar las api desarrollo/produccion
  apiVersion: '2.1', // la version de las api que la app requiere debe ser la misma que el backend
  defaultAppIndexState: "home", //Define la pagina principal de la app por defecto
  defaultAppTsFormat: "YYYY-MM-DD HH:mm:ss", //Define el formato fecha/hora por defecto
  GCMSenderID: "637476182190", //Se utiliza para registrar el dispositivo en GCM
  GCMDevMode: true //Define si se usan los certificados de DEV o PROD para APNS
})
//</replace>
.constant('APP_STATES', {
  login: 'login',
  mapa: 'mapa',
  home: 'home',
  noconn: 'noconn',
  configuracion: 'configuracion',
  soportes: {
    main: 'soportes',
    listado: 'soportes-listado',
    detalle: 'soportes-detalle',
    fotos: 'soportes-fotos',
    notas: 'soportes-notas'
  },
  supervisorSoportes: {
    main: 'supervisor-soportes',
    listado: 'supervisor-soportes-listado',
    detalle: 'supervisor-soportes-detalle',
    fotos: 'supervisor-soportes-fotos',
    notas: 'supervisor-soportes-notas'
  },
  abonados: {
    tabs: 'abonados-tabs',
    detalle: 'abonados-detalle',
    equipos: 'abonados-equipos',
    servicios: 'abonados-servicios'
  },
  mensajes: {
    main: 'mensajes',
    listado: 'mensajes-listado',
    detalle: 'mensajes-detalle'
  },
  rutinas: {
    main: 'rutinas',
    listado: 'rutinas-listado',
    detalle: 'rutinas-detalle'
  }
})
.constant('APP_EVENTS', {
  init: 'app-initialized',
  debugRefresh: 'app-debug-refresh',
  goToState: 'app-go-to-state',
  userLoaded: 'app-user-loaded',
  userLogin: 'app-user-login',
  userLogout: 'app-user-logout',
  httpRequestError: 'app-http-request-error',
  menu: {
    badgesLoad: 'app-menu-badges-loaded',
    badgesRefresh: 'app-menu-badges-refresh'
  },
  soporte: {
    nuevo: 'app-soporte-nuevo',
    modificado: 'app-soporte-modificado',
    eliminado: 'app-soporte-eliminado',
    delegado: 'app-soporte-delegado',
    refresh: 'app-soporte-refresh'
  }
})
.constant('APP_MODULOS', {
  usuarios: {
    id: 'USR',
    config: {}
  },
  mensajes: {
    id: 'MES',
    config: {}
  },
  soportes: {
    id: 'SOP',
    config: {
      aceptarRechazar: 'aceptar_rechazar',
      aceptarRechazarEditable: 'aceptar_rechazar_editable',
      iniciar: 'iniciar',
      cerrarSinIniciar: 'cerrar_sin_iniciar',
      ocultarCampos: 'esconder_campos_soporte',
      delegar: 'delegar',
      categorias: 'categorias',
      grupos: 'grupos',
      prioridad: 'prioridad',
      rangoHorario: 'rango_horario',
      rubros: 'rubros',
      rutinas: 'rutinas',
      rutinaEjecucionGeneraSoportes: 'rutina_ejecucion_genera_soportes',
      sinAsignarATodos: 'sin_asignar_a_todos',
      soportesPlaneados: 'soportes_planeados',
      documentoCierreObligatorio: 'documento_cierre_obligatorio'
    }
  }
})
.constant('NETWORK_EVENTS', {
  statusChange: 'status-change'
})
.constant('AUTH_EVENTS', {
  login: 'auth-login',
  logout: 'auth-logout',
  loadCredentials: 'auth-load-credentials',
  destroyCredentials: 'auth-destroy-credentials',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.constant('NOTIFICATION_EVENTS', {
  notificacionRecibida: '$cordovaPushV5:notificationReceived',
  notificacionError: '$cordovaPushV5:errorOccurred',
  soporte: {
    nuevo: 'notification-soporte-nuevo',
    modificado: 'notification-soporte-modificado'
  }
})
.constant('USER_ROLES', {
  admin: 'ADMIN',
  supervisor: 'SUPERVISOR',
  tecnico: 'TECNICO'
})
.constant('API_NOTIFICATION_TYPES', {
  soporte: {
    nuevo: 'NUEVO_SOPORTE',
    modificado: 'SOPORTE_MODIFICADO'
  }
})
.service('API_URLS', function (ConfiguracionService) {
  var apiUrl = ConfiguracionService.getApiBaseUrl();
  return {
    apiUrl: apiUrl,
    auth: {
      login: apiUrl + '/movil/login',
      logout: apiUrl + '/movil/logout'
    },
    abonado: {
      listado: apiUrl + '/abonado',
      detalle: apiUrl + '/abonado/:id',
      servicios: apiUrl + '/abonado/:id/servicios'
    },
    usuario: {
      cargar: apiUrl + '/usuario',
      listado: apiUrl + '/usuario/todos',
      cargarEstado: apiUrl + '/usuario/estado',
      cambiarEstado: apiUrl + '/usuario/estado/:idEstado',
      cargarTecnicos: apiUrl + '/usuario/tecnicos',
      estados: {
        listado: apiUrl + '/estadousuario',
        detalle: apiUrl + '/estadousuario/:id'
      }
    },
    equipo: {
      listadoPorAbonado: apiUrl + '/equipo/porabonado/:idAbonado/:idLugar'
    },
    mensaje: {
      listado: apiUrl + '/usuario/notificaciones',
      detalle: apiUrl + '/notificacion/:id',
      recibido: apiUrl + '/notificacion/:id/recibir/:ts',
      leido: apiUrl + '/notificacion/:id/leer/:ts'
    },
    soporte: {
      //listado: apiUrl + '/soporte',
      listado: apiUrl + '/soporte/pedidos',
      listadoFiltrado: apiUrl + '/soporte/filtrados',
      listadoPorFecha: apiUrl + '/soporte/porfecha/:ts',
      detalle: apiUrl + '/soporte/:id',
      detalleAdmin: apiUrl + '/soporte/admin/:id',
      recibido: apiUrl + '/soporte/:id/recibir/:ts',
      leido: apiUrl + '/soporte/:id/leer/:ts',
      iniciar: apiUrl + '/soporte/:id/iniciar/:ts',
      cerrar: apiUrl + '/soporte/:id/cerrar/:ts',
      aceptar: apiUrl + '/soporte/:id/aceptar',
      rechazar: apiUrl + '/soporte/:id/rechazar',
      autoAsignar: apiUrl + '/soporte/:id/autoasignar',
      delegar: apiUrl + '/soporte/:id/delegar/:idUsuario/:motivo',
      cambiarEstado: apiUrl + '/soporte/:id/estado/:idEstado',
      notificaciones: {
        listado: apiUrl + '/soporte/:id/notificaciones',
        enviadas: apiUrl + '/soporte/:id/notificaciones/enviadas',
        enviadasCount: apiUrl + '/soporte/:id/notificaciones/enviadas/count',
        enviadasLeidas: apiUrl + '/soporte/:id/notificaciones/enviadas/leer'
      },
      estados: {
        listado: apiUrl + '/estadosoporte',
        detalle: apiUrl + '/estadosoporte/:id',
        defecto: apiUrl + '/estadosoporte/defecto'
      },
      notas: {
        listado: apiUrl + '/soporte/:id/notas',
        agregar: apiUrl + '/soporte/:id/nota'
      },
      archivos: {
        cargar: apiUrl + '/soporte/:id/file',
        listado: apiUrl + '/soporte/:id/files'
      },
      estadisticas: {
        promedioEjecucion: apiUrl + '/estadistica/soporte/cantidad/promedioejecucion/:fechaDesde/:fechaHasta',
        promedioReaccion: apiUrl + '/estadistica/soporte/cantidad/promedioreaccion/:fechaDesde/:fechaHasta',
        promedioAsignado: apiUrl + '/estadistica/soporte/cantidad/promedioasignado/:fechaDesde/:fechaHasta',
        cantidadEstadoCierre: apiUrl + '/estadistica/soporte/cantidad/estadocierre/:fechaDesde/:fechaHasta',
        cantidadEstadoCierreSemana: apiUrl + '/estadistica/soporte/cantidad/estadocierre/diasemana/:fecha'
      }
    },
    rutina: {
      listado: apiUrl + '/rutina', //GET - lista de rutinas
      listadoPorNombre: apiUrl + '/rutina/pornombre/:nombre', //GET - lista de rutinas filtrada por nombre
      detalle: apiUrl + '/rutina/:id', //GET - detalle de rutina
      proximaEjecucion: apiUrl + '/rutina/:id/proximaEjecucion', //GET - proxima ejecucion de rutina
      proximasEjecuciones: apiUrl + '/rutina/:id/proximasEjecuciones' //GET - proximas ejecuciones de rutina
    },
    rutinaEjecucion: {
      listadoAdmin: apiUrl + '/rutinaEjecucion', //GET - devuelve lista de todas las ejecuciones
      listadoPorUsuarioAdmin: apiUrl + '/rutinaEjecucion/abiertas/usuario/:idUsuario', //GET - devuelve lista de ejecuciones por usuario
      listadoEjecucionesAbiertasAdmin: apiUrl + '/rutinaEjecucion/abiertas', //GET - devuelve lista de todas las ejecuciones abiertas
      listadoEjecucionesAbiertas: apiUrl + '/rutinaEjecucion/abiertas/usuario', //GET - devuelve solo las ejecuciones abiertas para el usuario actual
      detalle: apiUrl + '/rutinaEjecucion/:id', //GET - devuelve una ejecucion en concreto
      listadoSoportes: apiUrl + '/rutinaEjecucion/:id/soportes', //GET - devuelve los soportes para la ejecucion
      generarSoportes: apiUrl + '/rutinaEjecucion/:id/soportes' //POST - genera lo los soportes para la ejecucion
    },
    formulariocierre: {
      activos: apiUrl + '/formulariocierre',
      todos: apiUrl + '/formulariocierre/todos',
      detalle: apiUrl + '/formulariocierre/:id'
    },
    archivo: {
      cargar: apiUrl + '/blob',
      detalle: apiUrl + '/blob/:file/:millis',
      descargar: apiUrl + '/blob/download/:file/:millis'
    },
    geotracking: {
      enviar: apiUrl + '/tracking',
      get: apiUrl + '/tracking/:id'
    },
    notificacion: {
      listado: apiUrl + '/notificacion',
      detalle: apiUrl + '/notificacion/:id',
      recibida: apiUrl + '/notificacion/recibir/:id',
      leida: apiUrl + '/notificacion/leer/:id'
    },
    register: {
      GCM: apiUrl + '/movil/setgcmkey/:key',
      APNS: apiUrl + '/movil/setapnskey/:key'
    }
  };
});
