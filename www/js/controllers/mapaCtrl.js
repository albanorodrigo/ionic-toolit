angular.module('starter')

.controller('MapaCtrl', function ($scope, $stateParams, $q, $timeout, $cordovaGeolocation, $ionicPopup, uiGmapGoogleMapApi, uiGmapIsReady, GeotrackingService) {

  //Google maps API
  var googleMapsAPI;
  //Servicio de navegacion
  var directionsService;
  //Instrucciones de navegacion
  var directionsDisplay;
  //Lista de marcadores
  $scope.marcadores = [];
  //Mapa angular
  $scope.map = {
    center: {
      latitude: -34.891037,
      longitude: -56.157366
    },
    zoom: 10,
    bounds: {},
    scrollwheel: true,
    control: {},
    options: {
      scrollwheel: false,
      streetViewControl: false,
      zoomControl: false,
      draggable: true
    }
  };

  var rutaBusActiva;
  var rutaAutoActiva;
  var rutaCaminandoActiva;
  var geolocalizando;
  var origen;
  var destino;

  //PREVENT LOAD GOOGLE FONTS
  $timeout(function () {
    var head = document.getElementsByTagName('head')[0];
    // Save the original method
    var insertBefore = head.insertBefore;
    // Replace it!
    head.insertBefore = function (newElement, referenceElement) {
      if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=') > -1) {
        //console.info('Prevented Roboto from loading!');
        return;
      }
      insertBefore.call(head, newElement, referenceElement);
    };
  });
  //REMOVE GOOGLE FONTS
  function removeFontsGoogleAPI() {
    /*//var fontsGoogleAPI = document.querySelector('link[href*="//fonts.googleapis.com/css?family="]');
     var fontsGoogleAPI = angular.element(document.querySelector('link[href*="//fonts.googleapis.com/css?family="]'));
     if (fontsGoogleAPI) {
     //fontsGoogleAPI.parentNode.removeChild(fontsGoogleAPI);
     fontsGoogleAPI.remove();
     }*/
  }

  function initGoogleMaps(promise) {
    var q = $q.defer();
    uiGmapGoogleMapApi.then(function (maps) {
      console.log("*** uiGmapGoogleMapApi - READY!!! ***");
      googleMapsAPI = maps;
      uiGmapIsReady.promise(promise).then(function (instances) {
        var mapInstance = instances[0].map;
        console.log("*** uiGmapIsReady - READY!!! ***");
        //removeFontsGoogleAPI();
        //$scope.options.mapTypeId = googleMapsAPI.MapTypeId.SATELLITE;
        initRoutesService(mapInstance);
        initMapActions();
        q.resolve(mapInstance);
      }, function (error) {
        console.log("*** uiGmapIsReady - ERROR!!! ***");
        console.log(error);
        q.reject(error);
      });
    }, function (error) {
      console.log("*** uiGmapGoogleMapApi - ERROR!!! ***");
      console.log(error);
      q.reject(error);
    });
    return q.promise;
  }

  function initRoutesService(map) {
    directionsService = new googleMapsAPI.DirectionsService();
    directionsDisplay = new googleMapsAPI.DirectionsRenderer({
      draggable: false,
      map: map,
      //panel: document.getElementById('right-panel')
    });
  }

  function initMapActions() {
    $scope.calcularRutaCaminando = function () {
      if (destino) {
        var start = destino.lat + "," + destino.lng;
        calcularRuta(start, googleMapsAPI.TravelMode.WALKING);
      }
    };
    $scope.calcularRutaAuto = function () {
      if (destino) {
        var start = destino.lat + "," + destino.lng;
        calcularRuta(start, googleMapsAPI.TravelMode.DRIVING);
      }
    };
    $scope.calcularRutaBus = function () {
      if (destino) {
        var start = destino.lat + "," + destino.lng;
        calcularRuta(start, googleMapsAPI.TravelMode.TRANSIT);
      }
    };
  }

  function initSoporte(soporte) {
    if (soporte && soporte.lugar) {
      var lat = $stateParams.soporte.lugar.lat;
      var lng = $stateParams.soporte.lugar.lng;
      $scope.map.center = {latitude: lat, longitude: lng};
      $scope.map.zoom = 16;
      var marcadorSoporte = crearMarcador('soporte', lat, lng);
      marcadorSoporte.options = {
        /*icon: {
         url: "img/blue_dot.png",
         scaledSize: new google.maps.Size(46, 46),
         origin: new google.maps.Point(0, 0),
         anchor: new google.maps.Point(23, 23)
         },*/
        zIndex: 0
      };
      $scope.marcadores.push(marcadorSoporte);
      destino = {
        lat: lat,
        lng: lng
      };
    }
  }

  function ocultarMarcadores() {
    /*console.log("*** MARCADORES ***");
     console.log($scope.marcadores);
     console.log("*** CONTROL ***");
     console.log($scope.map.control);
     for (var i = 0; i < $scope.marcadores.length; i++) {
     delete $scope.marcadores[i];
     }*/
  }

  function updateRutaActiva(travelMode) {
    rutaBusActiva = false;
    rutaAutoActiva = false;
    rutaCaminandoActiva = false;
    $timeout(function () {
      if (travelMode === googleMapsAPI.TravelMode.WALKING) {
        rutaCaminandoActiva = true;
      } else if (travelMode === googleMapsAPI.TravelMode.DRIVING) {
        rutaAutoActiva = true;
      } else if (travelMode === googleMapsAPI.TravelMode.TRANSIT) {
        rutaBusActiva = true;
      }
    });
  }

  $scope.rutaCaminandoActiva = function () {
    return rutaCaminandoActiva;
  };

  $scope.rutaAutoActiva = function () {
    return rutaAutoActiva;
  };

  $scope.rutaBusActiva = function () {
    return rutaBusActiva;
  };

  $scope.geolocalizando = function () {
    return geolocalizando;
  };

  function crearMarcador(id, lat, lng) {
    var ret = {};
    ret['id'] = id;
    ret['latitude'] = lat;
    ret['longitude'] = lng;
    ret['title'] = 'm' + id;
    return ret;
  }

  function calcularRuta(cords, travelMode) {
    $q(function (resolve, reject) {
      $scope.showLoader($scope, "Obteniendo posición...", "MapaCtrl:calcularRuta");
      var options = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
        //var pos = new googleMapsAPI.LatLng(position.coords.latitude, position.coords.longitude);
        var start = position.coords.latitude + "," + position.coords.longitude;
        var end = cords;
        var request = {
          origin: start,
          destination: end,
          optimizeWaypoints: true,
          travelMode: travelMode,
        };
        if (travelMode === googleMapsAPI.TravelMode.TRANSIT) {
          request.transitOptions = {
            modes: [googleMapsAPI.TransitMode.BUS]
          };
        }
        $scope.showLoader($scope, "Buscando rutas...", "MapaCtrl:calcularRuta");
        directionsService.route(request, function (response, status) {
          if (status === googleMapsAPI.DirectionsStatus.OK) {
            //console.log("*** DIRECTIONS DISPLAY ***");
            //console.log(directionsDisplay);
            ocultarMarcadores();
            directionsDisplay.setDirections(response);
            updateRutaActiva(travelMode);
          }
          resolve(status);
        }, function (error) {
          reject(error);
        });
      }, function () {
        reject("Error, no se pudo obtener su posición actual.");
      });
    }).then(function (data) {
      //Query rutas OK...
      if (data !== googleMapsAPI.DirectionsStatus.OK) {
        $scope.showAlert('Ruta no disponible!', 'No se encontraron rutas para el modo de viaje seleccionado.');
      }
    }, function (error) {
      //Query rutas ERROR...
    }).finally(function () {
      $scope.hideLoader($scope, "MapaCtrl:calcularRuta");
    });
  }

  $scope.$on('$ionicView.afterEnter', function (e) {
    $scope.showLoader($scope, "Cargando mapa...", "MapaCtrl:afterEnter");
    initGoogleMaps(1).then(function (mapa) {
      if ($stateParams.soporte) {
        //Es un soporte...
        initSoporte($stateParams.soporte);
      } else if (false) {
        //Es un...
      }
    }).finally(function () {
      $scope.hideLoader($scope, "MapaCtrl:afterEnter");
    });
  });

  $scope.geolocalizar = function () {
    geolocalizando = true;
    var options = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
      console.log("*** Posicion actual del dispositivo ***");
      console.log(position);

      var sendPosition = position.coords;
      sendPosition.timestamp = position.timestamp;
      GeotrackingService.enviarPosicion(sendPosition);

      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      $scope.map.center = {latitude: lat, longitude: lng};
      $scope.map.zoom = 16;
      var mark1 = crearMarcador('location1', lat, lng);
      mark1.options = {
        icon: {
          /*path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
           strokeColor: "red",*/
          fillColor: "#000000",
          cornerColor: "#000000",
          scale: 1,
        },
        label: "X"
      };
      var mark2 = crearMarcador('location2', lat, lng);
      mark2.options = {
        icon: {
          url: "img/blue_dot.png",
          scaledSize: new google.maps.Size(46, 46),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(23, 23)
        },
        zIndex: -1
      };
      //$scope.marcadores.push(mark1);
      $scope.marcadores.push(mark2);
    }, function (error) {
      alert("Error, no se pudo obtener su posición actual.");
    }).finally(function () {
      geolocalizando = false;
    });
  };

  var watchOptions = {
    timeout: 3000,
    enableHighAccuracy: false // may cause errors if true
  };

  /*var watch = $cordovaGeolocation.watchPosition(watchOptions);
   
   watch.then(null, function (err) {
   // error
   }, function (position) {
   console.log("*** WHATCH POSITION ***");
   var lat = position.coords.latitude
   var long = position.coords.longitude
   });*/

  /*watch.clearWatch();
   // OR
   $cordovaGeolocation.clearWatch(watch)
   .then(function (result) {
   // success
   }, function (error) {
   // error
   });*/


  // Get the bounds from the map once it's loaded
  /*
   var createRandomMarker = function (i, bounds, idKey) {
   var lat_min = bounds.southwest.latitude,
   lat_range = bounds.northeast.latitude - lat_min,
   lng_min = bounds.southwest.longitude,
   lng_range = bounds.northeast.longitude - lng_min;
   
   if (idKey == null) {
   idKey = "id";
   }
   
   var latitude = lat_min + (Math.random() * lat_range);
   var longitude = lng_min + (Math.random() * lng_range);
   var ret = {
   latitude: latitude,
   longitude: longitude,
   title: 'm' + i
   };
   ret[idKey] = i;
   return ret;
   }; 
   $scope.$watch(function () {
   return $scope.map.bounds;
   }, function (nv, ov) {
   // Only need to regenerate once
   if (!ov.southwest && nv.southwest) {
   var markers = [];
   for (var i = 0; i < 50; i++) {
   markers.push(createRandomMarker(i, $scope.map.bounds))
   }
   $scope.marcadores = markers;
   }
   }, true);*/

});