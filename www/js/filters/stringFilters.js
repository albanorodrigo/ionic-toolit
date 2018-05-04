angular.module('starter')

.filter('split', function () {
  return function (stringList, splitChar) {
    if (stringList && angular.isString(stringList)) {
      return stringList.split((splitChar) ? splitChar : ",");
    }
    return [];
  };
});