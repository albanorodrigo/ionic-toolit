angular.module('starter')

.filter('tsFormat', function () {
  //Formatea una fecha desde un formato "X" indicado 
  //a un formato "X" de salida indicado.
  //console.log(new Date().toISOString());
  return function (ts, inputFormat, outputFormat) {
    if (ts && inputFormat && outputFormat) {
      return moment(ts, inputFormat).format(outputFormat);
    }
    return ts;
  };
})

.filter('tsFormatFromDefault', function (APP_CONFIG) {
  //Formatea una fecha a un formato de salida "X"
  //parseando la fecha con el formato predefinido en la configuracion.
  return function (ts, outputFormat) {
    var inputFormat = APP_CONFIG.defaultAppTsFormat;
    if (ts && inputFormat && outputFormat) {
      return moment(ts, inputFormat).format(outputFormat);
    }
    return ts;
  };
})

.filter('tsFormatDateTime', function (APP_CONFIG, CONSTANTES) {
  return function (ts) {
    var inputFormat = APP_CONFIG.defaultAppTsFormat;
    var outputFormat = CONSTANTES.tsDateTimeFormat;
    if (ts && inputFormat && outputFormat) {
      return moment(ts, inputFormat).format(outputFormat);
    }
    return ts;
  };
})

.filter('tsFormatDate', function (APP_CONFIG, CONSTANTES) {
  return function (ts) {
    var inputFormat = APP_CONFIG.defaultAppTsFormat;
    var outputFormat = CONSTANTES.tsDateFormat;
    if (ts && inputFormat && outputFormat) {
      return moment(ts, inputFormat).format(outputFormat);
    }
    return ts;
  };
})

.filter('tsFormatTime', function (APP_CONFIG, CONSTANTES) {
  return function (ts) {
    var inputFormat = APP_CONFIG.defaultAppTsFormat;
    var outputFormat = CONSTANTES.tsTimeFormat;
    if (ts && inputFormat && outputFormat) {
      return moment(ts, inputFormat).format(outputFormat);
    }
    return ts;
  };
})

.filter('tsFormatConditionalDateTime', function (APP_CONFIG, CONSTANTES) {
  return function (ts) {
    var inputFormat = APP_CONFIG.defaultAppTsFormat;
    // a ver si es ts es hoy
    if (moment(ts, inputFormat).startOf('day').isSame(moment().startOf('day'))) {
      // sí, devuelvo la hora
      var outputFormat = CONSTANTES.tsTimeFormat;
    } else {
      // no, devuelvo la fecha
      var outputFormat = CONSTANTES.tsDateFormat;      
    }
    if (ts && inputFormat && outputFormat) {
      return moment(ts, inputFormat).format(outputFormat);
    }
    return ts;
  };
});