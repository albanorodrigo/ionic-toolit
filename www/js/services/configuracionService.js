angular.module('starter')

.provider('ConfiguracionService', function (APP_CONFIG, URLS) {

  var STORAGE_APP_INDEX_STATE_KEY = 'config-app-index-state'; //State inicial.
  var STORAGE_API_BASE_URL_KEY = 'config-api-base-url'; //URL base de la api.
  var STORAGE_MENU_PRINCIPAL_POSICION_KEY = 'config-menu-principal-posicion'; //Posicion del menu principal  
  var STORAGE_TALK_ENABLED = 'config-talk-enabled'; // si usar el tts

  var configuracion = {};

  function getConfiguracion() {
    return configuracion;
  }

  function resetConfiguracion() {
    resetApiBaseUrl();
    resetMenuPrincipalPosicion();
    resetAppIndexState();
    resetTalkEnabled();
  }

  //<editor-fold desc="*** APP INDEX STATE ***" defaultstate="collapsed">
  function setAppIndexState(state) {
    if (state) {
      configuracion.appIndexState = state;
      window.localStorage.setItem(STORAGE_APP_INDEX_STATE_KEY, state);
    }
  }

  function getAppIndexState() {
    var state = window.localStorage.getItem(STORAGE_APP_INDEX_STATE_KEY);
    return (state !== null) ? state : APP_CONFIG.defaultAppIndexState;
  }

  function resetAppIndexState() {
    window.localStorage.removeItem(STORAGE_APP_INDEX_STATE_KEY);
    configuracion.appIndexState = APP_CONFIG.defaultAppIndexState;
  }
  //</editor-fold>

  //<editor-fold desc="*** API BASE URL ***" defaultstate="collapsed">
  function setApiBaseUrl(url) {
    if (url) {
      configuracion.apiBaseUrl = url;
      window.localStorage.setItem(STORAGE_API_BASE_URL_KEY, url);
    }
  }

  function getApiBaseUrl() {
    var url = window.localStorage.getItem(STORAGE_API_BASE_URL_KEY);
    return (url !== null) ? url : URLS.defaultApiBaseUrl;
  }

  function resetApiBaseUrl() {
    window.localStorage.removeItem(STORAGE_API_BASE_URL_KEY);
    configuracion.apiBaseUrl = URLS.defaultApiBaseUrl;
  }
  //</editor-fold>

  //<editor-fold desc="*** MENU PRINCIPAL POSICION ***" defaultstate="collapsed">
  function setMenuPrincipalPosicion(posicion) {
    if (posicion === "left" || posicion === "right") {
      configuracion.menuPrincipalPosicion = posicion;
      window.localStorage.setItem(STORAGE_MENU_PRINCIPAL_POSICION_KEY, posicion);
    }
  }

  function getMenuPrincipalPosicion() {
    var posicion = window.localStorage.getItem(STORAGE_MENU_PRINCIPAL_POSICION_KEY);
    if (posicion && (posicion === "left" || posicion === "right")) {
      return posicion;
    }
    return "left";
  }

  function resetMenuPrincipalPosicion() {
    window.localStorage.removeItem(STORAGE_MENU_PRINCIPAL_POSICION_KEY);
    configuracion.menuPrincipalPosicion = "left";
  }
  //</editor-fold>

  //<editor-fold desc="*** TALK ENABLED ***" defaultstate="collapsed">
  function setTalkEnabled(enabled) {
    configuracion.talkEnabled = enabled;
    window.localStorage.setItem(STORAGE_TALK_ENABLED, enabled);
  }

  function getTalkEnabled() {
    var enabled = window.localStorage.getItem(STORAGE_TALK_ENABLED);
    return (enabled !== null) ? enabled : APP_CONFIG.defaultTalkEnabled;
  }

  function resetTalkEnabled() {
    window.localStorage.removeItem(STORAGE_TALK_ENABLED);
    configuracion.talkEnabled = APP_CONFIG.defaultTalkEnabled;
  }
  //</editor-fold>

  function Configuracion() {
    /*return {
     getApiBaseUrl: getApiBaseUrl,
     setApiBaseUrl: setApiBaseUrl,
     test: function () {
     console.log("*** TEST PROVIDER ***");
     }
     };*/
    return this;
  }

  return {
    //Metodos de configuracion
    getConfiguracion: getConfiguracion,
    resetConfiguracion: resetConfiguracion,
    getAppIndexState: getAppIndexState,
    setAppIndexState: setAppIndexState,
    getApiBaseUrl: getApiBaseUrl,
    setApiBaseUrl: setApiBaseUrl,
    getMenuPrincipalPosicion: getMenuPrincipalPosicion,
    setMenuPrincipalPosicion: setMenuPrincipalPosicion,
    getTalkEnabled: getTalkEnabled,
    setTalkEnabled: setTalkEnabled,
    //Instancia del Provider
    $get: Configuracion
  };

});