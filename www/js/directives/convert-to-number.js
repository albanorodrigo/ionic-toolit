angular.module('starter')

.directive('convertToNumber', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function (val) {
        if (val === "null") {
          return null;
        }
        return (angular.isNumber(val)) ? parseInt(val) : undefined;
      });
      ngModel.$formatters.push(function (val) {
        if (val === null) {
          return "null";
        }
        return '' + val;
      });
    }
  };
});