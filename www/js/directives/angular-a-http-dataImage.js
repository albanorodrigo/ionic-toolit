(function () {
	'use strict';
	/*global angular, Blob, URL */

	angular.module('angular-a-http-dataImage', [
	]).directive('imageSrc', ['$http', function ($http) {
		return {
			link: function ($scope, elem, attrs) {
				function revokeObjectURL() {
					if ($scope.objectHREF) {
						URL.revokeObjectURL($scope.objectHREF);
					}
				}

				$scope.$watch('objectHREF', function (objectHREF) {
					elem.attr('href', objectHREF);
				});

				$scope.$on('$destroy', function () {
					revokeObjectURL();
				});

				attrs.$observe('imageSrc', function (url) {
					revokeObjectURL();

					if(url && url.indexOf('data:') === 0) {
						$scope.objectHREF = url;
					} else if(url) {
						$http.get(url, { responseType: 'arraybuffer' })
							.then(function (response) {
								var blob = new Blob(
									[ response.data ], 
									{ type: response.headers('Content-Type') }
								);
								$scope.objectHREF = URL.createObjectURL(blob);
							});
					}
				});
			}
		};
	}]);
}());
