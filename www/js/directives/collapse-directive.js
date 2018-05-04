angular.module('starter')

.directive('collapse', [function () {
    return {
      restrict: 'A',
      link: function ($scope, ngElement, attributes) {
        var element = ngElement[0];
        var elementHeight = getElementCurrentHeight();

        $scope.$watch(attributes.collapse, function (collapse) {
          //var newHeight = collapse ? 0 : getElementAutoHeight();
          var newHeight = collapse ? 0 : elementHeight;
          //console.log("new Height", newHeight);
          element.style["height"] = newHeight + 'px';
          //element.style["max-height"] = newHeight + 'px';
          ngElement.toggleClass('collapsed', collapse);
        });

        /*$scope.$watch(function () {
         return element.childNodes.length;
         }, function (newValue, oldValue) {
         if (newValue !== oldValue) {
         elementHeight = getElementCurrentHeight();
         }
         });*/

        function getElementAutoHeight() {
          var currentHeight = getElementCurrentHeight();
          element.style["height"] = 'auto';
          var autoHeight = getElementCurrentHeight();
          element.style["height"] = currentHeight;
          getElementCurrentHeight(); // Force the browser to recalc height after moving it back to normal
          return autoHeight;
        }

        function getElementCurrentHeight() {
          return element.offsetHeight;
        }
      }
    };
  }
]);