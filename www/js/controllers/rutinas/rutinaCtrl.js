angular.module('starter')

.controller('RutinaCtrl', function ($rootScope, $scope, $q, $ionicPopup, $ionicModal, $timeout, BroadcastService, AuthService, SoporteService, FormularioCierreService, FormularioCierreData, UsuarioService, APP_EVENTS, APP_MODULOS, USER_ROLES) {

  $scope.listaSoporteEstados;
  $scope.listaTecnicos;
  $scope.listaPrioridades;
  $scope.formularioCierre;
  $scope.formularioCierreData;
  $scope.delegarSoporteData;

  function initDatosController() {
    $scope.listaSoporteEstados = [];
    $scope.listaTecnicos = [];
    $scope.formularioCierre = {};
    $scope.formularioCierreData = new FormularioCierreData(null);
    $scope.delegarSoporteData = {soporte: null, idUsuario: null, motivo: null};
    $scope.listaPrioridades = [
      {idPrioridad: -2, nombre: "Muy baja"},
      {idPrioridad: -1, nombre: "Baja"},
      {idPrioridad: 0, nombre: "Normal"},
      {idPrioridad: 1, nombre: "Importante"},
      {idPrioridad: 2, nombre: "Urgente"}
    ];
  }

  function cargarDatosController() {
    console.log("*** CARGAR DATOS DE CONTROLLER: SoporteCtrl ***");
    initDatosController();
    if (AuthService.isAuthenticated()) {
      //Cargar estados de soportes
      cargarSoporteEstados();
      cargarFormularioCierre();
      cargarListaTecnicos();
    }
  }

  function registrarEventos() {
    //Se ejecuta cuando se carga el usuario
    BroadcastService.registrar($rootScope, APP_EVENTS.userLogin, function (event, data) {
      cargarDatosController();
    });
  }

  function cargarSoporteEstados() {
    $scope.showLoader($scope, "Cargando estados...");
    return SoporteService.cargarEstados().then(function (data) {
      console.log("*** ESTADOS DE SOPORTES ***");
      console.log(data);
      if (data) {
        $scope.listaSoporteEstados = data;
        //Mapear lista con el id del estado
        /*data.forEach(function (item) {
         $scope.listaSoporteEstados[item.idEstadoSoporte] = item;
         });*/
      }
      console.log($scope.listaSoporteEstados);
    }, function (error) {
      //alert("Error al cargar lista de estados del soporte");
    }).finally(function () {
      $scope.hideLoader($scope);
    });
  }

  function cargarFormularioCierre() {
    $scope.showLoader($scope, "Cargando formularios...", "SoporteCtrl:cargarFormularioCierre");
    return FormularioCierreService.cargarFormulariosCierre().then(function (data) {
      console.log("*** FORMULARIOS DE CIERRE ***");
      console.log(data);
      if (data && data.length) {
        var formActivo = null;
        data.forEach(function (item) {
          if (item.activo) {
            formActivo = item;
          }
        });
        if (formActivo) {
          return FormularioCierreService.cargarFormularioCierre(formActivo.idFormularioCierre).then(function (data) {
            console.log("*** FORMULARIO DE CIERRE ***");
            console.log(data);
            $scope.formularioCierre = data;
            $scope.formularioCierreData = new FormularioCierreData(data.idFormularioCierre);
          });
        }
        return $q.resolve(null);
      }
    }, function (error) {
      //alert("Error al cargar lista de formilarios de cierre");
    }).finally(function () {
      $scope.hideLoader($scope, "SoporteCtrl:cargarFormularioCierre");
    });
  }

  function cargarListaTecnicos() {
    $scope.showLoader($scope, "Cargando tecnicos...", "SoporteCtrl:cargarListaTecnicos");
    return UsuarioService.cargarTecnicos().then(function (data) {
      if (data) {
        $scope.listaTecnicos = data;
        //TODO: fix usuario sin asignar
        $scope.listaTecnicos.unshift({idUsuario: null, name: "Sin asignar..."});
      }
      return $q.resolve(data);
    }, function (error) {
      //alert("Error al cargar lista de tecnicos");
      return $q.reject(error);
    }).finally(function () {
      $scope.hideLoader($scope, "SoporteCtrl:cargarListaTecnicos");
    });
  }

  function aceptarSoporte(soporte) {
    $scope.showLoader($scope, "Aceptando soporte...");
    return SoporteService.aceptarSoporte(soporte).then(function (data) {
      return $q.resolve(data);
    }, function (error) {
      return $q.reject(error);
    }).finally(function () {
      $scope.hideLoader($scope);
    });
  }

  function rechazarSoporte(soporte) {
    $scope.showLoader($scope, "Rechazando soporte...");
    return SoporteService.rechazarSoporte(soporte).then(function (data) {
      return $q.resolve(data);
    }, function (error) {
      return $q.reject(error);
    }).finally(function () {
      $scope.hideLoader($scope);
    });
  }

  function tomarSoporte(soporte) {
    if (soporte) {
      $scope.showLoader($scope, "Tomando soporte...");
      return SoporteService.tomarSoporte(soporte).then(function (data) {
        return $q.resolve(data);
      }, function (error) {
        //var msj = (error.message) ? error.message : "Ocurrio un error al tomar el soporte";
        //$scope.showAlert('ERROR', msj);
        return $q.reject(error);
      }).finally(function () {
        $scope.hideLoader($scope);
      });
    }
  }

  function delegarSoporte(soporte, idUsuario, motivo) {
    $scope.showLoader($scope, "Delegando soporte...");
    return SoporteService.delegarSoporte(soporte, idUsuario, motivo).then(function (data) {
      return $q.resolve(data);
    }, function (error) {
      //var msj = (error.message) ? error.message : "Ocurrio un error al delegar el soporte";
      //$scope.showAlert('ERROR', msj);
      return $q.reject(error);
    }).finally(function () {
      $scope.hideLoader($scope);
    });
  }

  function resetDelegarSoporteData() {
    $scope.delegarSoporteData.soporte = null;
    $scope.delegarSoporteData.idUsuario = null;
    $scope.delegarSoporteData.motivo = null;
  }

  $scope.getColorEstadoSoporte = function (idEstadoSoporte) {
    if (idEstadoSoporte && $scope.listaSoporteEstados) {
      //var estado = $scope.listaSoporteEstados[idEstadoSoporte];
      var estado = null;
      $scope.listaSoporteEstados.forEach(function (item) {
        if (item.idEstadoSoporte === idEstadoSoporte) {
          estado = item;
          return;
        }
      });
      return (estado) ? estado.color : null;
    }
    return null;
  };

  // Crea la ventana modal para delegar un soporte
  $ionicModal.fromTemplateUrl('templates/soportes/soportes-delegar.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalDelegarSoporte = modal;
  });

  $scope.showModalDelegarSoporte = function (soporte) {
    $scope.delegarSoporteData.soporte = soporte;
    if ($scope.modalDelegarSoporte) {
      $scope.modalDelegarSoporte.show();
    }
  };

  $scope.hideModalDelegarSoporte = function () {
    if ($scope.modalDelegarSoporte) {
      $scope.modalDelegarSoporte.hide();
    }
    resetDelegarSoporteData();
  };

  $scope.delegarSoporte = function () {
    var promptPopup = $ionicPopup.show({
      template: '<textarea rows="4" ng-model="delegarSoporteData.motivo"></textarea>',
      title: 'Ingrese el motivo',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        {
          text: 'Cancelar',
          type: 'button-assertive',
          onTap: function (e) {
            //Clear id usuario seleccionado...
            $scope.delegarSoporteData.idUsuario = null;
          }
        },
        {
          text: 'Delegar',
          type: 'button-balanced',
          onTap: function (e) {
            if (!$scope.delegarSoporteData.motivo) {
              //No dejar que siga si no ingresa el motivo
              e.preventDefault();
            } else {
              var soporte = $scope.delegarSoporteData.soporte;
              var idUsuario = $scope.delegarSoporteData.idUsuario;
              var motivo = $scope.delegarSoporteData.motivo;
              delegarSoporte(soporte, idUsuario, motivo).then(function (data) {
                $scope.hideModalDelegarSoporte();
              }, function (error) {
                //Clear id usuario seleccionado...
                $scope.delegarSoporteData.idUsuario = null;
              });
              //return $scope.delegarSoporteData.motivo;
            }
          }
        }
      ]
    });
    /*promptPopup.then(function (res) {
     console.log('Tapped!', res);
     });*/
  };

  $scope.aceptarSoporte = function (soporte) {
    return $ionicPopup.confirm({
      title: 'Aceptar soporte',
      template: '¿Seguro desea aceptar el soporte?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-positive'
    }).then(function (isOK) {
      if (isOK) {
        aceptarSoporte(soporte);
      }
    });
  };

  $scope.rechazarSoporte = function (soporte) {
    return $ionicPopup.confirm({
      title: 'Rechazar soporte',
      template: '¿Seguro desea rechazar el soporte?',
      okText: 'Si',
      okType: 'button-assertive',
      cancelText: 'Cancelar',
      cancelType: 'button-positive'
    }).then(function (isOK) {
      if (isOK) {
        rechazarSoporte(soporte);
      }
    });
  };

  $scope.tomarSoporte = function (soporte) {
    $ionicPopup.confirm({
      title: 'Tomar soporte',
      template: '¿Seguro desea tomar a cargo el soporte?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        tomarSoporte(soporte);
      }
    });
  };

  $scope.showSoporteActions = function (soporte) {
    if (soporte) {
      var iniciar = $scope.showSoporteIniciarAction(soporte);
      var cerrar = $scope.showSoporteCerrarAction(soporte);
      var tomar = $scope.showSoporteTomarAction(soporte);
      var aceptarRechazar = $scope.showSoporteAceptarRechazarAction(soporte);
      return (iniciar || cerrar || tomar || aceptarRechazar);
    }
    return false;
  };

  $scope.showSoporteIniciarAction = function (soporte) {
    var iniciarOK = $scope.checkNecesitaIniciarSoporte();
    if (iniciarOK && soporte && !soporte.cerrado && !soporte.tsInicio && soporte.idUsuarioAsignado) {
      //Es un soporte que NO esta cerrado ni inicado o no necesita iniciarse, esta asignado a un tecnico
      return true;
    }
    return false;
  };

  $scope.showSoporteCerrarAction = function (soporte) {
    var iniciarOK = (!$scope.checkNecesitaIniciarSoporte() && $scope.checkCerrarSoporteSinIniciar());
    if (soporte && !soporte.cerrado && (iniciarOK || soporte.tsInicio) && soporte.idUsuarioAsignado) {
      //Es un soporte que NO esta cerrado pero SI esta iniciado o no necesita inicarse, tiene un tecnico asignado
      return true;
    }
    return false;
  };

  $scope.showSoporteTomarAction = function (soporte) {
    if (soporte && !soporte.cerrado && !soporte.idUsuarioAsignado) {
      //Es un soporte que NO esta cerrado, aun NO esta asignado
      return true;
    }
    return false;
  };

  $scope.showSoporteDelegarAction = function (soporte) {
    if (soporte) {
      var delegarHabilitado = $scope.checkDelegarSoporteHabilitado();
      var assignedToUser = $scope.checkSoporteAsignadoUsuario(soporte);
      if (soporte && !soporte.cerrado && assignedToUser && delegarHabilitado) {
        //Es un soporte que NO esta cerrado, esta asignado al usuario
        return true;
      }
    }
    return false;
  };

  $scope.showSoporteAceptarRechazarAction = function (soporte) {
    if (soporte) {
      var assignedToUser = $scope.checkSoporteAsignadoUsuario(soporte);
      if (soporte && !soporte.cerrado && soporte.necesitaAceptarRechazar && soporte.aceptarRechazar && assignedToUser) {
        //Es un soporte que NO esta cerrado y requiere aceptar o rechazar
        return true;
      }
    }
    return false;
  };

  $scope.checkShowSoporteCategoria = function () {
    return $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.categorias);
  };

  $scope.checkShowSoporteRangoHorario = function () {
    return $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.rangoHorario);
  };

  $scope.checkShowSoporteRubro = function () {
    return $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.rubros);
  };

  $scope.checkShowSoporteGrupo = function () {
    return $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.grupos);
  };

  $scope.checkShowSoportePrioridad = function (soporte) {
    var check = $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.prioridad);
    if (soporte) {
      return (check && soporte.prioridad && soporte.prioridad.prioridad !== 0);
    }
    return check;
  };

  $scope.checkSoporteAsignadoUsuario = function (soporte) {
    if (soporte) {
      return (soporte.idUsuarioAsignado === $scope.usuario.idUsuario);
    }
    return false;
  };

  $scope.checkSoporteAsignadoUsuarioOrSinAsignar = function (soporte) {
    if (soporte) {
      return ($scope.checkSoporteAsignadoUsuario(soporte) || soporte.idUsuarioAsignado === null);
    }
    return false;
  };

  $scope.checkSupervisionSoportes = function () {
    return ($scope.checkUserHasRol([USER_ROLES.admin, USER_ROLES.supervisor]));
  };

  $scope.checkSupervisionSoportesHabilitado = function () {
    var isTecnico = $scope.checkUserHasRol([USER_ROLES.tecnico]);
    return ($scope.checkSupervisionSoportes() && isTecnico);
  };

  $scope.checkNecesitaIniciarSoporte = function () {
    return $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.iniciar);
  };

  $scope.checkCerrarSoporteSinIniciar = function () {
    return $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.cerrarSinIniciar);
  };

  $scope.checkDelegarSoporteHabilitado = function () {
    return $scope.getModuloClienteConfigValue(APP_MODULOS.soportes.id, APP_MODULOS.soportes.config.delegar);
  };

  $scope.filterTecnicosByDelegarSoporte = function (tecnico) {
    var notNull = (tecnico.idUsuario !== null && tecnico.idUsuario !== "null");
    return (tecnico.idUsuario !== $scope.usuario.idUsuario && notNull);
  };

  $scope.getSoporteIconClass = function (soporte) {
    if (soporte) {
      if (soporte.cerrado) {
        return "icon icon-small ion-locked assertive";
      } else if (!soporte.idUsuarioAsignado || soporte.aceptarRechazar) {
        return "icon icon-small ion-ios-briefcase positive";
      } else if (soporte.tsInicio && !soporte.cerrado) {
        return "icon icon-medium ion-ios-play balanced";
      } else if (!soporte.tsNotificacionLeida) {
        return "icon icon-medium ion-ios-flag positive";
      }
    }
    return "";
  };

  $scope.getSoportePrioridadClass = function (soporte) {
    if (soporte && soporte.prioridad) {
      if (soporte.prioridad.prioridad > 0) {
        return "ion-arrow-up-c priority-very-high";
      } else if (soporte.prioridad.prioridad < 0) {
        return "ion-arrow-down-c priority-very-low";
      }
    }
    return "";
  };

  $timeout(function () {
    //cargarDatosController();
  });
  //registrarEventos();

});