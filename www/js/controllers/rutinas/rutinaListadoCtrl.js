angular.module('starter')

.controller('RutinaListadoCtrl', function ($rootScope, $scope, $timeout, $ionicActionSheet, $ionicScrollDelegate, $ionicListDelegate, $controller, UsuarioService, RutinaService, SoporteService, BroadcastService, APP_EVENTS, USER_ROLES) {

  $scope.adminRutinasActive;
  $scope.listaRutinas;
  $scope.listaEjecuciones;
  // guarda si el div de la ejecucion está abierto o cerrado
  $scope.divEjecuciones;

  //Inject controlador de filtros
  $scope.filtrosSoportesCtrl = $scope.$new();
  $controller('SoporteFiltrosCtrl', {$scope: $scope.filtrosSoportesCtrl});

  // Inject controlador de estados soporte
  $scope.estadosSoporteCtrl = $scope.$new();
  $controller('EstadosSoporteCtrl', {$scope: $scope.estadosSoporteCtrl});

  function initDatosController() {
    $scope.listaRutinas = [];
    $scope.listaEjecuciones = [];
    $scope.divEjecuciones = [];
    $scope.adminRutinasActive = false; //$scope.checkSupervisionSoportes();
  }

  function cargarDatosController() {
    //Verificar si ya se cargo el usuario...
    UsuarioService.getUsuario().then(function () {
      console.log("*** CARGAR DATOS DE CONTROLLER: RutinaListadoCtrl ***");
      initDatosController();
      cargarRutinas(true, false);
    });
  }

  function registrarEventos() {
    //Se ejecuta cuando se informa de un nuevo soporte
    /*BroadcastService.registrar($rootScope, APP_EVENTS.soporte.nuevo, function (event, data) {
     SoporteService.getSoportes().then(function (data) {
     $scope.listaSoportes = data;
     $scope.adminSoportesActive = SoporteService.isAdminSoportes();
     });
     });
     //Se ejecuta cuando se carga el usuario
     BroadcastService.registrar($rootScope, APP_EVENTS.userLogin, function (event, data) {
     cargarDatosController();
     });*/
  }

  function checkLoadAdminSoportes() {
    //Verifica si se deben cargar o no los soportes para el admin
    //dependiendo del check "modalidad supervisor"
    return ($scope.checkSupervisionSoportes() && $scope.adminSoportesActive);
  }

  function cargarRutinas(mostrarLoader, isPullToRefresh) {
    if (mostrarLoader) {
      $scope.showLoader($scope, "Cargando rutinas...", "RutinaListadoCtrl:cargarRutinas");
    }
    $timeout(function () {
      RutinaService.cargarEjecucionesAbiertas(true).then(function (data) {
        console.log("*** LISTADO DE EJECUCIONES ABIERTAS ***");
        console.log(data);
        $scope.listaEjecuciones = data;
        // si en la lista de los div abiertos no tengo el id de la ejecucion lo agrego y lo seteo a abierto
        angular.forEach($scope.listaEjecuciones, function(value, key) {
          if (this['div-'+value.idRutinaEjecucion] === undefined) { 
            this['div-'+value.idRutinaEjecucion] = true;
          }
        }, $scope.divEjecuciones);        
      }, function (error) {
        console.log("*** RutinaListadoCtrl: Error al cargar ejecuciones abiertas ***");
        console.log(error);
        //alert("Error al cargar lista de rutinas");
      }).finally(function () {
        if (mostrarLoader) {
          //$scope.hideLoader($scope);
          $scope.hideLoader($scope, "RutinaListadoCtrl:cargarRutinas");
        }
        if (isPullToRefresh) {
          $scope.$broadcast('scroll.refreshComplete');
        }
        $ionicScrollDelegate.resize();
      });
    }, (isPullToRefresh) ? 1500 : false); //fix ionic loader refresh
  }

  $scope.$on("$ionicView.leave", function () {
    $scope.closeListOptionButtons();
  });
  
  $scope.$on("$ionicView.enter", function() {
    cargarRutinas(true, false);
  });

  $scope.pullToRefresh = function () {
    cargarRutinas(false, true);
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
  
  $scope.toggleOpen = function(id) {
    $scope.divEjecuciones['div-'+id] = !$scope.divEjecuciones['div-'+id];
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