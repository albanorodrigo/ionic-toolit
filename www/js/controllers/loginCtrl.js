angular.module('starter')

.controller('LoginCtrl', function ($scope, $state, $ionicHistory, $timeout, BroadcastService, ConfiguracionService, AuthService, DeviceService, DebugService, APP_EVENTS) {

  $scope.data = {username: "", password: "", devicePhoneNumber: ""};

  $scope.mostrandoError = false;

  function cargarDatosController() {
    $timeout(function () {
      $scope.data.devicePhoneNumber = DeviceService.getDevicePhoneNumber();
    });
  }

  function resetForm(clearUsername, clearPassword) {
    if (clearUsername) {
      $scope.data.username = "";
    }
    if (clearPassword) {
      $scope.data.password = "";
    }
  }

  function ocultarTeclado() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.close();
    }
  }

  function showLoginError(title, message) {
    $scope.mostrandoError = true;
    $scope.showAlert(title, message).then(function (data) {
      $scope.mostrandoError = false;
    });
  }

  function validatePhoneNumber(phoneNumber) {
    //TODO: validar con expresion regular
    //var regexp = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
    //return (phoneNumber.match(regexp));
    return true;
  }

  $scope.login = function () {
    var ejecutar = true;
    var username = $scope.data.username.trim();
    var password = $scope.data.password;
    var devicePhoneNumber = $scope.data.devicePhoneNumber.trim();
    if ($scope.mostrandoError) {
      //fix: para que no se dispare el login si
      //ya se esta mostrando un error
      ejecutar = false;
    }
    if (ejecutar && (!username || !password || !devicePhoneNumber)) {
      ejecutar = false;
      showLoginError('Login incorrecto!', 'Por favor, ingrese usuario, contraseña y telefono.');
    }
    if (ejecutar && !validatePhoneNumber($scope.data.devicePhoneNumber)) {
      ejecutar = false;
      showLoginError('Telefono incorrecto!', 'Por favor, ingrese un numero de telefono valido.');
    }
    if (ejecutar) {
      //Obtener identificador del dispositivo...
      DeviceService.getDeviceUUID().then(function (deviceUUID) {
        console.log("**** DeviceService UUID: " + deviceUUID + " ***");
        DebugService.agregarLinea("GET -> APP DEVICE UUID: " + deviceUUID);
        //Guardar telefono...
        DeviceService.setDevicePhoneNumber(devicePhoneNumber);
        //Ejecutar login...
        $scope.showLoader($scope, "Validando credenciales...");
        AuthService.login(username, password, deviceUUID, devicePhoneNumber).then(function (data) {
          //Informo con un evento de la app que el usuario hizo login
          BroadcastService.broadcast(APP_EVENTS.userLogin, data);
          //El loggin es correcto, tambien verificar que se cargo el usuario
          $scope.cargarDatosUsuario().then(function (usuario) {
            //El usuario tambien fue cargado, enviar al index state.
            //Redirecionar a pagina de inicio
            var appIndexState = ConfiguracionService.getAppIndexState(); //APP_STATES.home
            resetForm(true, true); //Reset form
            $ionicHistory.nextViewOptions({disableBack: true}); //Disable back
            $state.go(appIndexState, {}, {location: "replace", reload: true}); //Redirect
          }, function (error) {
            showLoginError(error.mensaje, error.detalle);
          });
        }, function (error) {
          resetForm(false, true); //Reset form
          // si tengo un mensaje de error lo muestro, si no lo tengo quiere decir
          // que no hay nada para mostrar 
          if (error.mensaje) {
            showLoginError(error.mensaje, error.detalle);
          }
        }).finally(function () {
          $scope.hideLoader($scope);
        });
      }, function (error) {
        console.log("**** DeviceService UUID: ERROR***");
        showLoginError('ERROR', error);
      });
    }
    ocultarTeclado();
  };

  $timeout(function () {
    cargarDatosController();
  });

});