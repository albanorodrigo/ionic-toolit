angular.module('starter')

.controller('HomeCtrl', function ($rootScope, $scope, $timeout, $q, BroadcastService, SoporteEstadisticaService, APP_EVENTS) {

  $scope.chartAnimationPromises;
  $scope.chartSoportesEstadoSemanal;
  $scope.chartSoportesEstado;
  $scope.chartSoportesPromedio;

  function initDatosController() {
    $scope.chartAnimationPromises = [];
    $scope.chartSoportesEstadoSemanal = {$animation: $q.defer()};
    $scope.chartSoportesEstado = {$animation: $q.defer()};
    $scope.chartSoportesPromedio = {$animation: $q.defer()};
  }

  function cargarDatosController() {
    console.log("*** CARGAR DATOS DE CONTROLLER: HomeCtrl ***");
    initDatosController();
    cargarEstadisticas(false, false);
  }

  function registrarEventos() {
    //Se ejecuta cuando se carga el usuario
    BroadcastService.registrar($rootScope, APP_EVENTS.userLogin, function (event, data) {
      //TODO: se ejecuta mas de una vez cuando el controller no esta inicializado
      //se ejecuta el cargarDatosController y luego se ejecuta una vez mas por este evento.
      /*console.log("LALALSLALSLS ALSKASKLAKSLAKS")
       console.log(event, data)
       console.log($scope)*/
      cargarDatosController();
    });
  }

  function cargarEstadisticas(mostrarLoader, isPullToRefresh) {

    var promises = [];
    var fechaDesde = moment().startOf('month');
    var fechaHasta = moment().endOf('month');
    var fechaSemana = moment().startOf('date');
    //$scope.chartAnimationPromises = [];

    console.log("*** FECHA DESDE: ", fechaDesde);
    console.log("*** FECHA HASTA: ", fechaHasta);
    console.log("*** FECHA SEMANA: ", fechaSemana);

    $timeout(function () {
      //Agregar promesas de carga de estadisticas
      promises.push(cargarChartSoportesEstadoSemanal(fechaSemana));
      promises.push(cargarChartSoportesEstado(fechaDesde, fechaHasta));
      promises.push(cargarChartSoportesPromedio(fechaDesde, fechaHasta));
      //Monitorear promesas
      $q.all(promises).then(function () {
        //ESTADISTICAS - FIN DE CARGA
        if (isPullToRefresh) {
          $scope.$broadcast('scroll.refreshComplete');
        }
        $scope.refreshChartsCanvas();
      });
    }, (isPullToRefresh) ? 1500 : false); //fix ionic loader refresh

  }

  function cargarChartSoportesEstadoSemanal(fechaSemana) {
    //Animation promise...
    if (!$scope.chartSoportesEstadoSemanal.$animation) {
      var animationDefer = $q.defer();
      $scope.chartSoportesEstadoSemanal.$animation = animationDefer;
      $scope.chartAnimationPromises.push(animationDefer.promise);
    }
    //Chart options...
    $scope.chartSoportesEstadoSemanal.legend = false;
    $scope.chartSoportesEstadoSemanal.options = {
      responsive: true,
      onAnimationComplete: function () {
        $scope.chartSoportesEstadoSemanal.$animation.resolve();
      }
    };
    //Obtener datos...
    return SoporteEstadisticaService.cargarCantidadEstadoCierreSemana(fechaSemana).then(function (data) {
      if (data) {
        $scope.chartSoportesEstadoSemanal.labels = [];
        $scope.chartSoportesEstadoSemanal.data = [];
        $scope.chartSoportesEstadoSemanal.series = [];
        //generar labels...
        data.forEach(function (i) {
          $scope.chartSoportesEstadoSemanal.labels.push(i.label);
        });
        //generar series...
        data[0].value.forEach(function (i) {
          $scope.chartSoportesEstadoSemanal.series.push(i.label);
        });
        //generar valores...
        var totalSeries = $scope.chartSoportesEstadoSemanal.series.length;
        var countSeries = 0;
        while (countSeries < totalSeries) {
          var aux = [];
          data.forEach(function (i) {
            aux.push(i.value[countSeries].value);
          });
          $scope.chartSoportesEstadoSemanal.data.push(aux);
          countSeries++;
        }
      }
    });
  }

  function cargarChartSoportesEstado(fechaDesde, fechaHasta) {
    //Animation promise...
    if (!$scope.chartSoportesEstado.$animation) {
      var animationDefer = $q.defer();
      $scope.chartSoportesEstado.$animation = animationDefer;
      $scope.chartAnimationPromises.push(animationDefer.promise);
    }
    //Chart options...
    $scope.chartSoportesEstado.legend = true;
    $scope.chartSoportesEstado.options = {
      responsive: true,
      onAnimationComplete: function () {
        $scope.chartSoportesEstado.$animation.resolve();
      }
    };
    //Obtener datos...
    return SoporteEstadisticaService.cargarCantidadEstadoCierre(fechaDesde, fechaHasta).then(function (data) {
      if (data) {
        $scope.chartSoportesEstado.labels = [];
        $scope.chartSoportesEstado.data = [];
        data.forEach(function (i) {
          $scope.chartSoportesEstado.labels.push(i.label);
          $scope.chartSoportesEstado.data.push(i.value);
        });
      }
    });
  }

  function cargarChartSoportesPromedio(fechaDesde, fechaHasta) {
    //Animation promise...
    if (!$scope.chartSoportesPromedio.$animation) {
      var animationDefer = $q.defer();
      $scope.chartSoportesPromedio.$animation = animationDefer;
      $scope.chartAnimationPromises.push(animationDefer.promise);
    }
    //Chart options...
    $scope.chartSoportesPromedio.legend = false;
    $scope.chartSoportesPromedio.options = {
      responsive: true,
      onAnimationComplete: function () {
        $scope.chartSoportesPromedio.$animation.resolve();
      }
    };
    //Obtener datos...
    //return SoporteEstadisticaService.cargarPromedioEjecucion(fechaDesde, fechaHasta).then(function (data) {
    return SoporteEstadisticaService.cargarPromedioReaccion(fechaDesde, fechaHasta).then(function (data) {
      //return SoporteEstadisticaService.cargarPromedioAsignado(fechaDesde, fechaHasta).then(function (data) {
      if (data) {
        $scope.chartSoportesPromedio.labels = [];
        $scope.chartSoportesPromedio.data = [];
        var auxData = [];
        data.forEach(function (i) {
          $scope.chartSoportesPromedio.labels.push(i.label);
          auxData.push(i.value);
        });
        if (auxData.length) {
          $scope.chartSoportesPromedio.data.push(auxData);
        }
      }
    });
  }

  $scope.$on("$ionicView.enter", function () {
    $scope.refreshChartsCanvas();
  });

  $scope.refreshChartsCanvas = function () {
    /** FIX: redraw the charts canvas  **/
    $q.all($scope.chartAnimationPromises).then(function () {
      console.log("*** CHARTS ANIMATIONS END -> REFRESH CANVAS ***");
      window.dispatchEvent(new Event("resize"));
    });
  };

  $scope.pullToRefresh = function () {
    cargarEstadisticas(false, true);
  };

  $timeout(function () {
    cargarDatosController();
  });
  registrarEventos();

});