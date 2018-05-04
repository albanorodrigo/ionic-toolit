angular.module('starter')

.service('SoporteService', function ($rootScope, $q, $http, Soporte, SoporteEstado, BroadcastService, AUTH_EVENTS, APP_EVENTS) {

  var STORAGE_NUEVOS_COUNT_KEY = 'soporte-nuevos-count'; //Cantidad de soportes nuevos actuales

  var initOK = false;
  var adminSoportes = false;
  var filtros = {
        idAbonado: null,
        idLugar: null,
        idEstadoSoporte: null,
        idUsuarioAsignado: null,
        idUsuarioCreador: null,
        fechaCreacionDesde: null,
        fechaCreacionHasta: null,
        cerrado: null
  };
  var soportes = $q.defer().promise;
  var estados = $q.defer().promise;

  function init() {
    if (!initOK) {
      updateBadgeNumber();
      BroadcastService.registrar($rootScope, AUTH_EVENTS.logout, function () {
        clearCantidadSoportesNuevos();
      });
      initOK = true;
    }
  }

  //Actualiza un soporte en la lista de soportes
  var actualizarSoporte = function (soporte) {
    if (soporte) {
      soportes = soportes.then(function (data) {
        data.forEach(function (s, i) {
          if (s.idSoporte === soporte.idSoporte) {
            data[i] = soporte;
          }
        });
        return data;
      });
      //Informar que se modifico el soporte
      BroadcastService.broadcast(APP_EVENTS.soporte.modificado, soporte);
    }
  };

  //Elimina un soporte en la lista de soportes
  var eliminarSoporte = function (soporte) {
    if (soporte) {
      soportes = soportes.then(function (data) {
        data.forEach(function (s, i) {
          if (s.idSoporte === soporte.idSoporte) {
            data.splice(i, 1);
          }
        });
        return data;
      });
      //Informar que se elimino el soporte
      BroadcastService.broadcast(APP_EVENTS.soporte.eliminado, soporte);
    }
  };

  var updateBadgeNumber = function () {
    console.log("*** EVENT TRIGGER SoporteService: SOPORTE REFRESH -> BADGE MENU ***");
    var data = {badgeType: "soporte", number: getCantidadSoportesNuevos()};
    BroadcastService.broadcast(APP_EVENTS.menu.badgesRefresh, data);
  };

  var actualizarCantidadSoportesNuevos = function () {
    console.log("*** Actualizar cantidad de soportes nuevos ***");
    soportes.then(function (data) {
      window.localStorage.setItem(STORAGE_NUEVOS_COUNT_KEY, data.length);
      updateBadgeNumber();
    });
  };

  var clearCantidadSoportesNuevos = function () {
    console.log("*** Limpiar cantidad de soportes nuevos ***");
    window.localStorage.removeItem(STORAGE_NUEVOS_COUNT_KEY);
    updateBadgeNumber();
  };

  function getCantidadSoportesNuevos() {
    return window.localStorage.getItem(STORAGE_NUEVOS_COUNT_KEY);
  }

  function actualizarSoportesNotificaciones() {
    if (soportes) {
      soportes.forEach(function (s, i) {
        if (s.idSoporte) {
          notificacionesCount(s.idSoporte).then(function (data) {
            soportes[i].notificacionesPendientes = data.count;
          });
        }
      });
    }
  }

  function actualizarSoporteNotificaciones(soporte) {
    if (soporte && soporte.idSoporte) {
      notificacionesCount(soporte.idSoporte).then(function (data) {
        soporte.notificacionesPendientes = data.count;
        actualizarSoporte(soporte);
      });
    }
  }

  function cargarSoportes(loadSoportesAdmin, conFiltros) {
    if (conFiltros !== undefined) {
      filtros = conFiltros;
    }
    if (loadSoportesAdmin) {
      return cargarSoportesAdmin();
    } else {
      return cargarSoportesGeneric();
    }
  }

  function recargarSoportes() {
    //Recarga los soportes tomando la modalidad
    //actual del listado de soportes (supervisor/tecnico)
    return cargarSoportes(adminSoportes);
  }

  function cargarSoportesGeneric() {
    console.log("*** Cargar lista de soportes ***");
    soportes = Soporte.listado({}, function (data) {
      //console.log(data);
      //soportes = data;
      adminSoportes = false;
      actualizarCantidadSoportesNuevos();
      //actualizarSoportesNotificaciones();
    }, function (error) {
      console.log("*** Error al cargar lista de soportes ***");
    }).$promise;
    return soportes;
  }

  function cargarSoportesAdmin() {
    console.log("*** Cargar lista de soportes de administracion ***");
    soportes = Soporte.listadoFiltrado(filtros, function (data) {
      //console.log(data);
      //soportes = data;
      adminSoportes = true;
      actualizarCantidadSoportesNuevos();
      //actualizarSoportesNotificaciones();
    }, function (error) {
      console.log("*** Error al cargar lista de soportes de administracion ***");
    }).$promise;
    return soportes;
  }

  function cargarSoporte(idSoporte, loadSoporteAdmin) {
    console.log("*** Cargar soporte id: " + idSoporte + " ***");
    if (!idSoporte) {
      return $q.reject("El \"id\" del soporte es nulo.");
    }
    var dataSend = {id: idSoporte};
    var loadFn = (loadSoporteAdmin) ? Soporte.getAdmin(dataSend) : Soporte.get(dataSend);
    return loadFn.$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar soporte id:" + idSoporte + " ***");
      console.log(error);
      if (error.status === 403 || (error.data && error.data.status === "403")) {
        //No esta autorizado para cargar el soporte (eliminar de lista)
        eliminarSoporte({idSoporte: idSoporte});
        return $q.resolve(null);
      }
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar soporte!");
    });
  }

  function recargarSoporte(idSoporte) {
    console.log("*** Re-cargar soporte id: " + idSoporte + " ***");
    $http.defaults.showGlobalErrors = false;
    return cargarSoporte(idSoporte).then(function (data) {
      //Actualizar el soporte en la lista
      actualizarSoporte(data);
      //Actualizar la cantidad de notificaciones
      actualizarSoporteNotificaciones(data);
      //retornar soporte remoto
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al re-cargar soporte id:" + idSoporte + " ***");
      console.log(error);
      return $q.reject((error.data) ? error.data : "Error al re-cargar soporte!");
    });
  }

  function iniciarSoporte(soporte) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    if (soporte.tsInicio) {
      //return $q.reject({message: "El soporte ya se encuentra iniciado."});
    }
    console.log("*** Iniciar soporte id: " + soporte.idSoporte + " ***");
    var dataSend = {id: soporte.idSoporte, ts: moment().format("YYYY-MM-DD[T]HH:mm:ss")};
    return Soporte.iniciar(dataSend).$promise.then(function (data) {
      console.log(data);
      //soporte.tsInicio = data.ts;
      //actualizarSoporte(soporte);
      //return $q.resolve(soporte);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al iniciar soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al iniciar soporte!");
    });
  }

  function cerrarSoporte(soporte, idEstadoCierre, formularioCierreData) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    } else if (!(formularioCierreData && formularioCierreData.idFormularioCierre)) {
      //return $q.reject("No hay definido un formulario de cierre.");
    }
    if (soporte.tsCierre) {
      //return $q.reject({message: "El soporte ya se encuentra cerrado."});
    }
    formularioCierreData.id = soporte.idSoporte;
    formularioCierreData.idEstadoSoporte = idEstadoCierre;
    formularioCierreData.ts = moment().format("YYYY-MM-DD[T]HH:mm:ss");
    console.log("*** Cerrar soporte id: " + soporte.idSoporte + " ***");
    return Soporte.cerrar(formularioCierreData).$promise.then(function (data) {
      console.log(data);
      //soporte.tsCierre = data.ts;
      //actualizarSoporte(soporte);
      //return $q.resolve(soporte);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al cerrar soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cerrar soporte!");
    });
  }

  function aceptarSoporte(soporte) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    console.log("*** Aceptando soporte id: " + soporte.idSoporte + " ***");
    return Soporte.aceptar({id: soporte.idSoporte}).$promise.then(function (data) {
      console.log(data);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al aceptar soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al aceptar el soporte!");
    });
  }

  function rechazarSoporte(soporte) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    console.log("*** Rechazando soporte id: " + soporte.idSoporte + " ***");
    return Soporte.rechazar({id: soporte.idSoporte}).$promise.then(function (data) {
      console.log(data);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al rechazar soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al rechazar el soporte!");
    });
  }

  function tomarSoporte(soporte) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    if (soporte.idUsuarioAsignado) {
      //return $q.reject({message: "El soporte ya asignado."});
    }
    console.log("*** Tomando soporte id: " + soporte.idSoporte + " ***");
    return Soporte.autoAsignar({id: soporte.idSoporte}).$promise.then(function (data) {
      console.log(data);
      //if (data) {
      //  soporte.idUsuarioAsignado = data.idUsuario;
      //  soporte.nombreUsuarioAsignado = data.name;
      //}
      //actualizarSoporte(soporte);
      //return $q.resolve(soporte);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al tomar soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al tomar soporte!");
    });
  }

  function delegarSoporte(soporte, idUsuario, motivo) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    var dataSend = {id: soporte.idSoporte, idUsuario: idUsuario, motivo: motivo};
    console.log("*** Delegar soporte id: " + soporte.idSoporte + " ***");
    console.log(dataSend);
    return Soporte.delegar(dataSend).$promise.then(function (data) {
      console.log(data);
      //eliminarSoporte(soporte);
      //BroadcastService.broadcast(APP_EVENTS.soporte.delegado, soporte);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al delegar soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al delegar soporte!");
    });
  }

  function soporteLeido(soporte) {
    //TODO: verificar si hay conexion
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    if (soporte.tsNotificacionLeida) {
      //return $q.reject({message: "El soporte ya fue marcado como leido."});
    }
    console.log("*** Marcar soporte como leido ID: " + soporte.idSoporte + " ***");
    var dataSend = {id: soporte.idSoporte, ts: moment().format("YYYY-MM-DD[T]HH:mm:ss")};
    return Soporte.leido(dataSend).$promise.then(function (data) {
      console.log(data);
      //soporte.tsNotificacionLeida = data.ts;
      //actualizarSoporte(soporte);
      //return $q.resolve(data);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al marcar soporte como leido. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al iniciar soporte!");
    });
  }

  function cambiarEstadoSoporte(soporte, idEstado) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    if (!idEstado) {
      return $q.reject("El estado es nulo.");
    }
    console.log("*** Cambiar estado soporte id: " + soporte.idSoporte + " ***");
    return Soporte.cambiarEstado({id: soporte.idSoporte, idEstado: idEstado}).$promise.then(function (data) {
      console.log(data);
      //if (data.estado) {
      //  soporte.idEstadoSoporte = data.estado.idEstadoSoporte;
      //  soporte.estadoSoporte = data.estado.estado;
      //}
      //actualizarSoporte(soporte);
      //return $q.resolve(soporte);
      return recargarSoporte(soporte.idSoporte);
    }, function (error) {
      console.log("*** Error al cambiar estado del soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cambiar estado del soporte!");
    });
  }

  function cargarEstados() {
    console.log("*** Cargar lista de estados de soportes ***");
    estados = SoporteEstado.all({}, function (data) {
      console.log(data);
      //estados = data;
      //$estados.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar lista de estados de soportes ***");
      //$estados.reject(error);
    }).$promise;
    return estados;
  }

  function cargarNotas(idSoporte) {
    console.log("*** Cargar notas del soporte id: " + idSoporte + " ***");
    if (!idSoporte) {
      return $q.reject("El \"id\" del soporte es nulo.");
    }
    return Soporte.listadoNotas({id: idSoporte}).$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar notas del soporte id:" + idSoporte + " ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar notas del soporte!");
    });
  }

  function agregarNota(soporte, nota) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    if (!nota) {
      return $q.reject("La nota es nula o vacia.");
    }
    console.log("*** Agregar nota soporte id: " + soporte.idSoporte + " ***");
    var dataSend = {
      id: soporte.idSoporte,
      texto: nota,
      ts: moment().format("YYYY-MM-DD[T]HH:mm:ss"), /*moment().toISOString()*/
      ok: 1
    };
    return Soporte.agregarNota(dataSend).$promise.then(function (data) {
      console.log(data);
      //soporte.idEstadoSoporte = data.idEstadoSoporte;
      //soporte.estadoSoporte = data.estado;
      //actualizarSoporte(soporte);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al agregar la nota del soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error agregar la nota del soporte!");
    });
  }

  function cargarArchivos(idSoporte) {
    console.log("*** Cargar archivos del soporte id: " + idSoporte + " ***");
    if (!idSoporte) {
      return $q.reject("El \"id\" del soporte es nulo.");
    }
    return Soporte.listadoArchivos({id: idSoporte}).$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar archivos del soporte id:" + idSoporte + " ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar archivos del soporte!");
    });
  }

  function agregarArchivo(soporte, archivo) {
    if (!(soporte && soporte.idSoporte)) {
      return $q.reject("El soporte es nulo.");
    }
    if (!archivo) {
      return $q.reject("El archivo es nulo o vacio.");
    }
    console.log("*** Agregar archivo soporte id: " + soporte.idSoporte + " ***");
    var dataSend = {id: soporte.idSoporte, file: archivo};
    return Soporte.agregarArchivo(dataSend).$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al agregar archivo al soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al agregar archivo del soporte!");
    });
  }

  function notificacionesLeidas(idSoporte) {
    if (!idSoporte) {
      return $q.reject("El \"id\" del soporte es nulo.");
    }
    console.log("*** Marcar notificaciones del soporte ID: " + idSoporte + " como leidas ***");
    return Soporte.notificacionesLeidas({id: idSoporte}).$promise.then(function (data) {
      console.log(data);
      return recargarSoporte(idSoporte);
    }, function (error) {
      console.log("*** Error al marcar notificaciones del soporte como leidas. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al marcar notificaciones del soporte como leidas!");
    });
  }

  function notificacionesCount(idSoporte) {
    if (!idSoporte) {
      return $q.reject("El \"id\" del soporte es nulo.");
    }
    console.log("*** Contar notificaciones enviadas del soporte ID: " + idSoporte + " ***");
    return Soporte.notificacionesCount({id: idSoporte}).$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al contar notificaciones enviadas del soporte. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al contar notificaciones enviadas del soporte!");
    });
  }

  return {
    getSoportes: function () {
      return soportes;
    },
    getEstados: function () {
      return estados;
    },
    isAdminSoportes: function () {
      return adminSoportes;
    },
    init: init,
    getCantidadSoportesNuevos: getCantidadSoportesNuevos,
    cargarSoportes: cargarSoportes,
    recargarSoportes: recargarSoportes,
    cargarSoporte: cargarSoporte,
    recargarSoporte: recargarSoporte,
    iniciarSoporte: iniciarSoporte,
    cerrarSoporte: cerrarSoporte,
    aceptarSoporte: aceptarSoporte,
    rechazarSoporte: rechazarSoporte,
    tomarSoporte: tomarSoporte,
    delegarSoporte: delegarSoporte,
    soporteLeido: soporteLeido,
    cambiarEstadoSoporte: cambiarEstadoSoporte,
    cargarEstados: cargarEstados,
    cargarNotas: cargarNotas,
    agregarNota: agregarNota,
    cargarArchivos: cargarArchivos,
    agregarArchivo: agregarArchivo,
    notificacionesLeidas: notificacionesLeidas,
    notificacionesCount: notificacionesCount
  };

})

.run(function ($rootScope, SoporteService, BroadcastService, APP_EVENTS, NOTIFICATION_EVENTS, APP_STATES) {
  /*$timeout(function () { console.log("**** $timeout READY ****"); });
   angular.element(document).ready(function () { console.log("*** ANGULAR DOCUMENT READY ***"); });*/

  //Inicializar "SoporteServices"
  SoporteService.init();
  //Registrar eventos del modulo de soportes
  BroadcastService.registrar($rootScope, NOTIFICATION_EVENTS.soporte.nuevo, function (event, notificacion) {
    console.log("*** EVENT HANDLER SoporteService: NOTIFICACION SOPORTE -> NUEVO ***");
    if (notificacion.additionalData.coldstart === "truexxx") {
      console.log("*** EVENT TRIGGER SoporteService: NOTIFICACION SOPORTE -> SOPORTE REFRESH ***");
      BroadcastService.broadcast(APP_EVENTS.soporte.nuevo);
      console.log("*** EVENT TRIGGER SoporteService: NOTIFICACION SOPORTE -> REDIRECCIONAR A SOPORTES ***");
      var stateData = {name: APP_STATES.soportes.listado};
      BroadcastService.broadcast(APP_EVENTS.goToState, stateData);
    } else {
      SoporteService.recargarSoportes().then(function (data) {
        console.log("*** EVENT TRIGGER SoporteService: SOPORTE REFRESH ***");
        BroadcastService.broadcast(APP_EVENTS.soporte.nuevo);
      });
    }
  });
  BroadcastService.registrar($rootScope, NOTIFICATION_EVENTS.soporte.modificado, function (event, notificacion) {
    console.log("*** EVENT HANDLER SoporteService: NOTIFICACION SOPORTE -> MODIFICADO ***");
    if (notificacion.additionalData.coldstart === "truexxx") {
      console.log("*** EVENT TRIGGER SoporteService: NOTIFICACION SOPORTE -> SOPORTE REFRESH ***");
      BroadcastService.broadcast(APP_EVENTS.soporte.modificado);
      console.log("*** EVENT TRIGGER SoporteService: NOTIFICACION SOPORTE -> REDIRECCIONAR A SOPORTES ***");
      var stateData = {
        name: APP_STATES.soportes.detalle,
        params: {soporteId: notificacion.additionalData.id}
      };
      BroadcastService.broadcast(APP_EVENTS.goToState, stateData);
    } else {
      if (notificacion.additionalData.id) {
        SoporteService.recargarSoporte(notificacion.additionalData.id).then(function (data) {
          BroadcastService.broadcast(APP_EVENTS.soporte.modificado, data);
        });
      }
    }
  });
  /*BroadcastService.registrar($rootScope, APP_EVENTS.init, function (event) {
   //console.log("*** EVENT: APP INIT - SOPORTE ***");
   });*/
})

.provider('Soporte', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.soporte.detalle, {id: '@id'}, {
      listado: {
        method: 'GET',
        isArray: true,
        url: API_URLS.soporte.listado,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      listadoFiltrado: {
        method: 'POST',
        isArray: true,
        url: API_URLS.soporte.listadoFiltrado,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      listadoFecha: {
        method: 'GET',
        isArray: true,
        url: API_URLS.soporte.listadoFecha,
        params: {ts: "@ts"},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      get: {
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      getAdmin: {
        method: 'GET',
        url: API_URLS.soporte.detalleAdmin,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      recibido: {
        url: API_URLS.soporte.recibido,
        method: 'PUT',
        params: {ts: "@ts"},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {ts: aux.body} : aux.body;
          }
          return data;
        }
      },
      leido: {
        url: API_URLS.soporte.leido,
        method: 'PUT',
        params: {ts: "@ts"},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {ts: aux.body} : aux.body;
          }
          return data;
        }
      },
      iniciar: {
        url: API_URLS.soporte.iniciar,
        method: 'PUT',
        params: {ts: "@ts"},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {ts: aux.body} : aux.body;
          }
          return data;
        }
      },
      cerrar: {
        url: API_URLS.soporte.cerrar,
        method: 'PUT',
        params: {ts: "@ts"},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {ts: aux.body} : aux.body;
          }
          return data;
        }
      },
      aceptar: {
        url: API_URLS.soporte.aceptar,
        method: 'PUT',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      rechazar: {
        url: API_URLS.soporte.rechazar,
        method: 'PUT',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      autoAsignar: {
        url: API_URLS.soporte.autoAsignar,
        method: 'PUT',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      delegar: {
        url: API_URLS.soporte.delegar,
        method: 'PUT',
        params: {idUsuario: "@idUsuario", motivo: "@motivo"},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      cambiarEstado: {
        url: API_URLS.soporte.cambiarEstado,
        method: 'PUT',
        params: {idEstado: '@idEstado'},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {estado: aux.body} : aux.body;
          }
          return data;
        }
      },
      listadoNotas: {
        url: API_URLS.soporte.notas.listado,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      agregarNota: {
        url: API_URLS.soporte.notas.agregar,
        method: 'PUT',
        data: {texto: '@texto', ts: '@ts', ok: '@ok'},
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      listadoArchivos: {
        url: API_URLS.soporte.archivos.listado,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      agregarArchivo: {
        url: API_URLS.soporte.archivos.cargar,
        method: 'POST',
        data: {file: '@file'},
        responseType: "json",
        headers: {'Content-Type': 'multipart/form-data'},
        transformRequest: angular.identity,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      notificacionesLeidas: {
        url: API_URLS.soporte.notificaciones.enviadasLeidas,
        method: 'PUT',
        showGlobalErrors: false,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      notificacionesCount: {
        url: API_URLS.soporte.notificaciones.enviadasCount,
        method: 'GET',
        showGlobalErrors: false,
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {count: aux.body} : aux.body;
          }
          return data;
        }
      }
    });

    function Soporte() {

    }

    Soporte.listado = metodos.listado;
    Soporte.listadoFiltrado = metodos.listadoFiltrado;
    Soporte.listadoFecha = metodos.listadoFecha;
    Soporte.get = metodos.get;
    Soporte.getAdmin = metodos.getAdmin;
    Soporte.leido = metodos.leido;
    Soporte.recibido = metodos.recibido;
    Soporte.iniciar = metodos.iniciar;
    Soporte.cerrar = metodos.cerrar;
    Soporte.aceptar = metodos.aceptar;
    Soporte.rechazar = metodos.rechazar;
    Soporte.autoAsignar = metodos.autoAsignar;
    Soporte.delegar = metodos.delegar;
    Soporte.cambiarEstado = metodos.cambiarEstado;
    Soporte.listadoNotas = metodos.listadoNotas;
    Soporte.agregarNota = metodos.agregarNota;
    Soporte.listadoArchivos = metodos.listadoArchivos;
    Soporte.agregarArchivo = metodos.agregarArchivo;
    Soporte.notificacionesLeidas = metodos.notificacionesLeidas;
    Soporte.notificacionesCount = metodos.notificacionesCount;
    return Soporte;
  };

})

.provider('SoporteEstado', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.soporte.estados.detalle, {id: '@id'}, {
      get: {
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      all: {
        url: API_URLS.soporte.estados.listado,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      defecto: {
        url: API_URLS.soporte.estados.defecto,
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function SoporteEstado() {

    }

    SoporteEstado.all = metodos.all;
    SoporteEstado.get = metodos.get;
    SoporteEstado.defecto = metodos.defecto;
    return SoporteEstado;
  };

});