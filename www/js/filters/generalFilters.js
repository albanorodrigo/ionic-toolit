angular.module('starter')

.filter('soporteRangoHorario', function () {
  return function (rangoHorario) {
    var result = "";
    if (rangoHorario) {
      var nombreTxt = rangoHorario.nombre;
      var rangoTxt = "";
      if (rangoHorario.hhmmInicio && rangoHorario.hhmmFin) {
        rangoTxt = rangoHorario.hhmmInicio + " - " + rangoHorario.hhmmFin;
      } else if (rangoHorario.hhmmInicio) {
        rangoTxt = rangoHorario.hhmmInicio;
      } else if (rangoHorario.hhmmFin) {
        rangoTxt = rangoHorario.hhmmFin;
      }
      if (nombreTxt && rangoTxt) {
        result = nombreTxt + " (" + rangoTxt + ")";
      } else if (nombreTxt) {
        result = nombreTxt;
      } else if (rangoTxt) {
        result = rangoTxt;
      }
    }
    return result;
  };
});