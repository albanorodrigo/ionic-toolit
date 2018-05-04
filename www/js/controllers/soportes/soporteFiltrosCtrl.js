angular.module('starter')

.controller('SoporteFiltrosCtrl', function ($scope, $timeout, $ionicModal, BroadcastService, APP_EVENTS) {

  var filtrosAplicados = {};

  var filtrosPorDefecto = {
    filtrarPor: "A",
    antiguedad: "H"
  };

  $scope.filtros = {};
  
$scope.$watch('filtros', function(newValue, oldValue) {
    console.log("*** CAMBIO scope FILTROS: ",JSON.stringify(oldValue),JSON.stringify(newValue));
}, true);

  
  $scope.listaTecnicosFiltros = [];

  $scope.filtroFechaRadios = [
      { text: "Soportes por antiguedad", value: "A", selected: true },
      { text: "Soportes entre fechas", value: "F" , selected: false  }
  ];

  $scope.filtroAntiguedades = [
      { text: "Desde siempre", value: "*", selected: true },
      { text: "Hoy", value: "H" , selected: false  },
      { text: "Hoy y ayer", value: "HA" , selected: false  },
      { text: "Esta semana", value: "S" , selected: false  },
      { text: "Últimas dos semanas", value: "2S" , selected: false  }
  ];  
    
  function deleteFiltrosVacios(f) {
    angular.forEach(f, function (value, key) {
      if (value === undefined) {
        delete f[key];
      }
    });
  }
  
  function refreshSoportes() {
    console.log("*** refreshSoportes() ***");
    BroadcastService.broadcast(APP_EVENTS.soporte.refresh);
  }


  function generarFiltrosAplicados() {
    console.log("*** generarFiltrosAplicados() ***");
    angular.copy($scope.filtros, filtrosAplicados);
    deleteFiltrosVacios(filtrosAplicados);
    console.log("*** generarFiltrosAplicados() -> "+JSON.stringify(filtrosAplicados));
    refreshSoportes();
  }

  function generarFiltros() {
    console.log("*** generarFiltros() -> filtrosAplicados: "+JSON.stringify(filtrosAplicados));
    // la primera vez que entro si el listado para el filtro no existe y los tecnicos estan cargados lo copio
    if ($scope.listaTecnicosFiltros.length === 0 && $scope.listaTecnicos.length > 0) {
      angular.copy($scope.listaTecnicos, $scope.listaTecnicosFiltros);
      // agrego el todos
      $scope.listaTecnicosFiltros.unshift({idUsuario: -1, name: "- Todos -"});
    }
    //
    if (filtrosAplicados.fechaDesde !== undefined && filtrosAplicados.fechaDesde !== null) {
      filtrosAplicados.fechaDesde = moment(filtrosAplicados.fechaDesde).toDate();
    }
    if (filtrosAplicados.fechaHasta !== undefined && filtrosAplicados.fechaHasta !== null) {
      filtrosAplicados.fechaHasta = moment(filtrosAplicados.fechaHasta).toDate();
    }
    angular.copy(filtrosAplicados, $scope.filtros);
    deleteFiltrosVacios($scope.filtros);
//    if ($scope.filtros.filtrarPor === undefined) {
//      $scope.filtros.filtrarPor = "A";
//      $scope.filtros.antiguedad = "H";
//    }
    console.log("*** generarFiltros() -> $scope.filtros: "+JSON.stringify($scope.filtros));
  }

  // Crea la ventana modal para filtrar listado de soportes
  $ionicModal.fromTemplateUrl('templates/soportes/soportes-filtros.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalFiltrarSoportes = modal;
  });

  $scope.showModal = function (soporte) {
    if ($scope.modalFiltrarSoportes) {
      $scope.modalFiltrarSoportes.show();
      generarFiltros();
    }
  };

  $scope.hideModal = function () {
    if ($scope.modalFiltrarSoportes) {
      $scope.modalFiltrarSoportes.hide();
    }
  };

  $scope.aplicarFiltros = function () {
    generarFiltrosAplicados();
    $scope.hideModal();
  };

  $scope.limpiarFiltros = function () {
    $scope.filtros = {};
  };
  
  $scope.resetFiltros = function () {
    $scope.filtros = {};
    generarFiltrosAplicados();
  };

  $scope.setearFiltros = function(filtrosASetear) {
    console.log("*** setearFiltros() *** "+JSON.stringify(filtrosASetear));
    filtrosAplicados = filtrosASetear;
    console.log("*** setearFiltros() *** "+JSON.stringify(filtrosAplicados));
    generarFiltros();
  };

  $scope.getFiltrosAplicados = function () {
    return filtrosAplicados;
  };

  $scope.getFiltrosPorDefecto = function () {
    return filtrosPorDefecto;
  };

  $scope.countFiltrosAplicados = function () {
    var result = 0;
    if (filtrosAplicados) {
      angular.forEach(filtrosAplicados, function (value, key) {
        result++;
      });
    }
    return result;
  };

});