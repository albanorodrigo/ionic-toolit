angular.module('starter')

.service('DeviceService', function ($q) {

  //UUID emulado del dispositivo (se utiliza para test con navegadores etc...)
  var STORAGE_EMULATED_UUID_KEY = 'device-emulated-uuid';
  //Numero telefonico del dispositivo
  var STORAGE_PHONE_NUMBER_KEY = 'device-phone-number';

  var initOK = false;

  function init() {
    if (!initOK) {
      //cargarDatos();
      initOK = true;
    }
  }

  function generateEmulatedUUID() {
    // si no estoy adentro de cordova genero un uuid para poder emular
    var isCordovaApp = (
            document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1 &&
            !!window.cordova
    );
    console.log('*** IS CORDOVA: '+isCordovaApp);
    if (!isCordovaApp) {
      // no es cordova, me fijo si ya existe un uuid emulado
      var emulatedUUID = getEmulatedUUID();
      // si no existe lo genero
      if (!emulatedUUID) {
        emulatedUUID = Math.round(Math.random() * (99999999 - 10000000) + 10000000);
        console.log('*** SIMULACION EN BROWSER, UUID GENERADO: '+emulatedUUID);
      } else {
        console.log('*** SIMULACION EN BROWSER, UUID YA EXISTENTE: '+emulatedUUID);
      }
      window.localStorage.setItem(STORAGE_EMULATED_UUID_KEY, emulatedUUID);
    }
  }

  function getEmulatedUUID() {
    //SOLO PARA DEV: Retirna el valor del UUID emulado
    var emulatedUUID = window.localStorage.getItem(STORAGE_EMULATED_UUID_KEY);
    return emulatedUUID;
  }

  function getDeviceUUID() {
    var defered = $q.defer();
    var emulatedUUID = getEmulatedUUID();
    //Se utiliza un UUID emulado (es un navegador web o algun dispositivo de test)
    if (emulatedUUID) {
      defered.resolve(emulatedUUID);
    }
    //Obtener UUID real del dispositivo (cuando la app esta instalada en un dispositivo)
    if (window.cordova && window.plugins && window.plugins.uniqueDeviceID) {
      var model = device.model;
      var platform = device.platform;
      var uuid = device.uuid;
      var version = device.version;
      var manufacturer = device.manufacturer;
      var isSim = device.isVirtual;
      var serial = device.serial;
      console.log("*** model:"+model+" platform:"+platform+" uuid:"+uuid+" ver:"+version+" man:"+manufacturer+" sim:"+isSim+" serial:"+serial+"***");
      //Es un dispositivo y existe el plugin "uniqueDeviceID"
      document.addEventListener("deviceready", function () {
        //Obtener identificador del dispositivo
        window.plugins.uniqueDeviceID.get(function (uuid) {
          //Se pudo obtener el UUID del dispositivo
          console.log("*** GET UUID DEVICE DATA - OK: "+uuid+" ***");
          //console.log(angular.toJson(uuid));
          defered.resolve(uuid);
        }, function (error) {
          //Error al obtener UUID del dispositivo
          console.log("*** GET UUID DEVICE DATA - ERROR ***");
          //console.log(angular.toJson(error));
          defered.reject("Error al obtener identificador del dispositivo");
        });
      }, false);
    } else {
      defered.reject("Imposible obtener identificador del dispositivo");
    }
    return defered.promise;
  }

  function getDevicePhoneNumber() {
    return window.localStorage.getItem(STORAGE_PHONE_NUMBER_KEY);
  }

  function setDevicePhoneNumber(phoneNumber) {
    window.localStorage.setItem(STORAGE_PHONE_NUMBER_KEY, phoneNumber);
  }

  return {
    init: init,
    generateEmulatedUUID: generateEmulatedUUID,
    getDevicePhoneNumber: getDevicePhoneNumber,
    setDevicePhoneNumber: setDevicePhoneNumber,
    getDeviceUUID: getDeviceUUID
  };

})

.run(function (DeviceService) {
  // si es necesario genero un uuid emulado
  DeviceService.generateEmulatedUUID();
  //DeviceService.init();
});
