angular.module('starter')

.controller('SoporteListadoCtrl', function (
  $rootScope, $scope, $timeout, $ionicActionSheet, 
  $ionicScrollDelegate, $ionicListDelegate, $controller, $ionicModal,
  UsuarioService, SoporteService, BroadcastService, 
  APP_EVENTS, USER_ROLES) {

  var STORAGE_FILTROS_KEY = 'filtro-soporte'; // filtros por defecto
  var STORAGE_ORDEN_KEY = 'orden-soporte'; // forma de ordenar los soportes

  $scope.adminSoportesActive;
  $scope.listaSoportes;
  $scope.ordenListadoOpciones = [
    //{nombre:'APH', orden:['-orden.dia', '-orden.titulo', 'orden.diapos']},
    {
      nombre:'VP', 
      desc:'Más viejos primeros; en el mismo día: por prioridad y hora', 
      orden:['-orden.dia', '-orden.titulo', 'orden.pri', 'orden.ts']
    },{
      nombre:'RP', 
      desc:'Más recientes primeros; en el mismo día: por prioridad y hora', 
      orden:['orden.dia' , '-orden.titulo', 'orden.pri', 'orden.ts']
    },{
      nombre:'VH', 
      desc:'Más viejos primeros; en el mismo día: por hora', 
      orden:['-orden.dia', '-orden.titulo', 'orden.ts']
    },{
      nombre:'RH', 
      desc:'Más recientes primeros; en el mismo día: por hora', 
      orden:['orden.dia' , '-orden.titulo', 'orden.ts']
    },{
      nombre:'Vh', 
      desc:'Más viejos primeros; en el mismo día: por hora descendiente', 
      orden:['-orden.dia', '-orden.titulo', '-orden.ts']
    },{
      nombre:'Rh', 
      desc:'Más recientes primeros; en el mismo día: por hora descendiente', 
      orden:['orden.dia' , '-orden.titulo', '-orden.ts']
    }
  ]; 
  $scope.ordenListadoActivo;
  $scope.ordenListado;


  //Inject controlador de filtros
  $scope.filtrosSoportesCtrl = $scope.$new();
  $controller('SoporteFiltrosCtrl', {$scope: $scope.filtrosSoportesCtrl});
  

  function initDatosController() {
    $scope.listaSoportes = [];
    $scope.adminSoportesActive = $scope.checkSupervisionSoportes();
  }

  function cargarDatosController() {
    //Verificar si ya se cargo el usuario...
    UsuarioService.getUsuario().then(function () {
      console.log("*** CARGAR DATOS DE CONTROLLER: SoporteListadoCtrl ***");
      initDatosController();
      cargarSoportes(true, false);
    });
  }

  function registrarEventos() {
    //Se ejecuta cuando se informa de un nuevo soporte
    BroadcastService.registrar($rootScope, APP_EVENTS.soporte.nuevo, function (event, data) {
      cargarSoportes(true,false);
      $scope.adminSoportesActive = SoporteService.isAdminSoportes();
//      SoporteService.getSoportes().then(function (data) {
//        $scope.listaSoportes = data;
//        $scope.adminSoportesActive = SoporteService.isAdminSoportes();
//      });
    });
    // se ejecuta cuando hay que refrescar los soportes
    BroadcastService.registrar($rootScope, APP_EVENTS.soporte.refresh, function (event, data) {
      cargarSoportes(true,false);
    });
    //Se ejecuta cuando se carga el usuario
    BroadcastService.registrar($rootScope, APP_EVENTS.userLogin, function (event, data) {
      cargarDatosController();
    });
  }

  function checkLoadAdminSoportes() {
    //Verifica si se deben cargar o no los soportes para el admin
    //dependiendo del check "modalidad supervisor"
    return ($scope.checkSupervisionSoportes() && $scope.adminSoportesActive);
  }

  function cargarSoportes(mostrarLoader, isPullToRefresh) {
    if (mostrarLoader) {
      //$scope.showLoader($scope, "Cargando soportes...");
      $scope.showLoader($scope, "Cargando soportes...", "SoporteListadoCtrl:cargarSoportes");
    }
    var filtrosAplicados = $scope.filtrosSoportesCtrl.getFiltrosAplicados();
    // hay filtros?
    if (filtrosAplicados.filtrarPor === undefined) {
      // no, a ver si hay uno guardado
      console.log("*** cargarSoportes no hay filtros");
      filtrosGuardados = window.localStorage.getItem(STORAGE_FILTROS_KEY);
      console.log("*** cargarSoportes: filtroGuardado -> "+filtrosGuardados);
      // si hay y lo podemos parsear, lo usamos
      if (filtrosGuardados) {
        try {
         filtrosAplicados = JSON.parse(filtrosGuardados);
       } catch (err) {
         // si no podemos parsear el filtro, lo borramos para que no genere problemas
         window.localStorage.removeItem(STORAGE_FILTROS_KEY);
         // seteamos el filtro por defecto
         filtrosAplicados = $scope.filtrosSoportesCtrl.getFiltrosPorDefecto();
       }
      } else {
        // no hay filtros guardados, usamos los filtros por defecto
         filtrosAplicados = $scope.filtrosSoportesCtrl.getFiltrosPorDefecto();
      }
    } else {
      console.log("*** cargarSoportes llegaron filtros");
      if (filtrosAplicados.guardarPorDefecto) {
        console.log("*** cargarSoportes guardo filtros por defecto");
        filtrosAplicados.guardarPorDefecto = false;
        window.localStorage.setItem(STORAGE_FILTROS_KEY, JSON.stringify(filtrosAplicados));       
      }
    }
    console.log("*** cargarSoportes FILTROS: "+JSON.stringify(filtrosAplicados));
    // seteo los filtros en el controller así cuando se abre la ventana están correctos
    $scope.filtrosSoportesCtrl.setearFiltros(filtrosAplicados);    
    //
    // @TODO : la prioridad?!?!
    //
    var fechaDesde = null;
    var fechaHasta = null;
    if (filtrosAplicados.filtrarPor === "A") {
      switch (filtrosAplicados.antiguedad) {
        case "*":
          // no hago nada ya que usando null como fechas me trae todo
          break;
        case "H":
          // hoy: start y end del día
          fechaDesde = moment().startOf('day');
          fechaHasta = moment().endOf('day');
          console.log("*** *** "+moment().format("YYYY-MM-DD[T]HH:mm:ss"));
          break;
        case "HA":
          // hoy y ayer: saco uno al start de hoy
          fechaDesde = moment().startOf('day').add(-1, 'days');
          fechaHasta = moment().endOf('day');
          break;
        case "S":
          // esta semana
          fechaDesde = moment().startOf('isoWeek');
          fechaHasta = moment().endOf('isoWeek');
          break;
        case "2S":
          // ultimas dos semanas
          fechaDesde = moment().subtract(1, 'weeks').startOf('isoWeek');
          fechaHasta = moment().endOf('isoWeek');
          break;
      }
    } else if (filtrosAplicados.filtrarPor === "F") {
      // agarro las fechas de los filtros o null
      fechaDesde = filtrosAplicados.fechaDesde || null;
      fechaHasta = filtrosAplicados.fechaHasta || null; 
      // si no hay null, genero la fecha moment
      if (fechaDesde !== null) fechaDesde = moment(fechaDesde);
      if (fechaHasta !== null) fechaHasta = moment(fechaHasta);      
    }
    var asignado = null;
    var idAsignado = null;
    if (filtrosAplicados.idUsuarioAsignado > 0) {
      // si viene un usuario asignado entonces muestro solamente los asignados
      asignado = true;
      idAsignado = filtrosAplicados.idUsuarioAsignado;
    } else if (filtrosAplicados.idUsuarioAsignado < 0) {
      // si viene como usuario asignado -1 quiero ver todo
      asignado = null;
      idAsignado = null;
    } else {
      // quedan solamente lo que no fueron asignados
      var asignado = false;
      idAsignado = null;
    }
    // formateo las fechas
    if (fechaDesde !== null) fechaDesde = fechaDesde.format("YYYY-MM-DD[T]HH:mm:ss");
    if (fechaHasta !== null) fechaHasta = fechaHasta.format("YYYY-MM-DD[T]HH:mm:ss");
    var filtros = {
        idAbonado: null,
        idLugar: null,
        idEstadoSoporte: filtrosAplicados.idEstadoSoporte,
        idUsuarioAsignado: idAsignado,
        asignado: asignado,
        idUsuarioCreador: null,
        fechaCreacionDesde: fechaDesde,
        fechaCreacionHasta: fechaHasta,
        cerrado: null
    }
    console.log("*** cargarSoportes "+JSON.stringify(filtros));
    
    $timeout(function () {
      SoporteService.cargarSoportes(checkLoadAdminSoportes(), filtros).then(function (data) {
        $scope.listaSoportes = [];
        // tengo que recorrer los soportes para calcular el atraso 
        var oldAtraso = "";
        // la variable orden guarda adentro los niveles necesarios a ordenar los
        // soportes en la pantalla:
        // index : index general del array, actualmente no se usa para ordenar
        // dia   : dias de atraso, se usa para ordenar por día
        // diapos: posicion adentro del dia
        // ts    : timestamp del soporte o nulo
        // pri   : prioridad del soporte o nulo
        // titulo: true solamente si es un titulo
        var orden = {index:0, dia:0, diapos:0, ts:null, pri:null, titulo:true};
        // primero los ordeno por timestamp, usando el campo fechaHoraPlaneado
        // si viene, si no uso fecha y hora de creación
        data.sort(function(s1,s2){
          var ts1 = moment(s1.fechaHoraPlaneado ? s1.fechaHoraPlaneado : s1.tsCreacion);
          var ts2 = moment(s2.fechaHoraPlaneado ? s2.fechaHoraPlaneado : s2.tsCreacion);
          // si es el mismo dia ordeno por prioridad o hora
          if (ts1.isSame(ts2,'day')) {
            var pri1 = s1.prioridad ? s1.prioridad.prioridad : 0;
            var pri2 = s2.prioridad ? s2.prioridad.prioridad : 0;
            // si la prioridad es diferente uso esa, si no ordeno por el timestamp completo
            if (pri1 !== pri2) {
              // ok, uso esa
              return pri1 < pri2 ? 1 : -1;
            }
          }
          return ts1.isAfter(ts2) ? 1 : -1;
          //return ts1 - ts2;
        }).forEach(function(soporte, i){
          // por cada soporte pido el atraso con respecto a hoy
          var atraso = $scope.getSoporteAtraso(soporte);
          // calculo la posición "natural" dependiendo de donde lo encuentro
          orden.index = i;
          // si es diferente desde el anterior...
          if (atraso.dias !== oldAtraso.dias) {
            // actualizo
            oldAtraso = atraso;
            // reseteo el index por dia del orden
            orden.dia = atraso.dias;
            orden.diapos = 0;
            orden.ts = null;
            orden.pri = null;
            orden.titulo = true;
            // agrego a la lista de soportes un objecto separador
            $scope.listaSoportes.push({isSeparator: true, atraso: atraso, orden: Object.assign({},orden)});
          } 
          // al soporte agrego el atraso y la orden "natural" que calculé arriba
          soporte.atraso = atraso;
          orden.diapos++;
          orden.ts = soporte.fechaHoraPlaneado ? soporte.fechaHoraPlaneado : soporte.tsCreacion;
          orden.pri = soporte.prioridad ? soporte.prioridad : 0;
          orden.titulo = false;
          soporte.orden = Object.assign({},orden);
          // agrego el soporte
          //console.log(soporte.fechaHoraPlaneado, soporte.tsCreacion, orden);
          $scope.listaSoportes.push(soporte);            
        });
        //$scope.listaSoportes = data;
        $scope.adminSoportesActive = SoporteService.isAdminSoportes();
        //$ionicScrollDelegate.resize();
      }, function (error) {
        console.log("*** SoporteListadoCtrl: Error al cargar soportes ***");
        console.log(error);
        //alert("Error al cargar lista de soportes");
      }).finally(function () {
        if (mostrarLoader) {
          //$scope.hideLoader($scope);
          $scope.hideLoader($scope, "SoporteListadoCtrl:cargarSoportes");
        }
        if (isPullToRefresh) {
          $scope.$broadcast('scroll.refreshComplete');
        }
        $ionicScrollDelegate.resize();
      });
    }, (isPullToRefresh) ? 1500 : false); //fix ionic loader refresh
  }

// ---- ordenar/ ----

  // Crea la ventana modal para ordenar listado de soportes
  $ionicModal.fromTemplateUrl('templates/soportes/soportes-listado-ordenar.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalOrdenarSoportes = modal;
  });
  
  $scope.showModalOrdenarSoportes = function () {
    if ($scope.modalOrdenarSoportes) {
      $scope.modalOrdenarSoportes.show();
    }
  };

  $scope.hideModalOrdenarSoportes = function () {
    if ($scope.modalOrdenarSoportes) {
      $scope.modalOrdenarSoportes.hide();
    }
  };

  $scope.ordenarSoportes = function(orden) {
    console.log("*** ordenar listado soporte "+JSON.stringify(orden));
    window.localStorage.setItem(STORAGE_ORDEN_KEY, JSON.stringify(orden));       
    $scope.ordenListadoActivo = orden.nombre;
    $scope.ordenListado = orden.orden;
     $scope.hideModalOrdenarSoportes();
  };

  // ---- ordenar/ ----

  $scope.$on("$ionicView.leave", function () {
    $scope.closeListOptionButtons();
  });
  
  $scope.$on("$ionicView.enter", function() {
    // cargo el ultimo orden seleccionado
    var orden = JSON.parse(window.localStorage.getItem(STORAGE_ORDEN_KEY));
    // si no hay, agarra el primero
    if (orden === null) {
      orden = $scope.ordenListadoOpciones[0];
    }
    $scope.ordenarSoportes(orden);
    console.log("*********** "+$scope.ordenListadoActivo);
  });

  $scope.pullToRefresh = function () {
    cargarSoportes(false, true);
  };

  $scope.infiniteScrollHayMasDatos = function () {
    return false;
  };

  $scope.infiniteScrollCargarMasDatos = function () {
    $timeout(function () {
      //$scope.listaSoportes = [];
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }, 3000);
  };

  $scope.showActionSheetMasOpciones = function (soporte) {
    if (soporte) {
      //IMPORTENTE: es importante que las listas queden sincronizadas (los indices) 
      //ya que los items de "sheetButtonsCallback" deben coincidir con los botones en "sheetButtons"
      var sheetButtons = [];
      var sheetButtonsCallback = [];

      if ($scope.showSoporteTomarAction(soporte)) {
        sheetButtons.push({text: '<i class="icon ion-briefcase"></i>Tomar soporte'});
        sheetButtonsCallback.push(function () {
          $scope.tomarSoporte(soporte);
        });
      }

      if ($scope.showSoporteDelegarAction(soporte)) {
        sheetButtons.push({text: '<i class="icon ion-shuffle"></i>Delegar soporte...'});
        sheetButtonsCallback.push(function () {
          $scope.showModalDelegarSoporte(soporte);
        });
      }

      var cancelCallbcak = function () {
        $scope.closeListOptionButtons();
      };

      var buttonClickedCallback = function (index) {
        var fn = sheetButtonsCallback[index];
        if (fn && typeof fn === "function") {
          fn();
        }
        $scope.closeListOptionButtons();
        return true;
      };

      var sheetOptions = {
        buttons: sheetButtons,
        titleText: 'Mas opciones',
        cancelText: '<i class="icon ion-android-close"></i>Cancelar',
        cancel: cancelCallbcak,
        buttonClicked: buttonClickedCallback
      };
      // Show the action sheet
      var sheetHide = $ionicActionSheet.show(sheetOptions);
    }
  };

  $scope.closeListOptionButtons = function () {
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.aceptar = function (soporte) {
    $scope.aceptarSoporte(soporte).finally(function () {
      $scope.closeListOptionButtons();
    });
  };

  $scope.rechazar = function (soporte) {
    $scope.rechazarSoporte(soporte).finally(function () {
      $scope.closeListOptionButtons();
    });
  };

  $scope.onChangeAdminSoportesActive = function () {
    $scope.adminSoportesActive = !($scope.adminSoportesActive);
    $scope.filtrosSoportesCtrl.resetFiltros();
    cargarSoportes(true, false);
    $ionicScrollDelegate.resize();
  };

  $timeout(function () {
    cargarDatosController();
  });
  registrarEventos();

});