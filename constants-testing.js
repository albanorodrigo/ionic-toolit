// *** TESTING ***
.constant('URLS',{
  baseUrl: "https://dev.tecytal.com",
  defaultUrl: "https://dev.tecytal.com",
  defaultApiBaseUrl: "https://dev.tecytal.com/rest"
})
.constant('APP_CONFIG', {
  devMode: true, //activa-desactiva las funcionalidades de desarrollo (IMPORTANTE poner en "false" en prod.)
  cambiarApi: true, // permite cambiar las api desarrollo/produccion
  apiVersion: '2.1', // la version de las api que la app requiere debe ser la misma que el backend
  defaultAppIndexState: "home", //Define la pagina principal de la app por defecto
  defaultAppTsFormat: "YYYY-MM-DD HH:mm:ss", //Define el formato fecha/hora por defecto
  GCMSenderID: "637476182190", //Se utiliza para registrar el dispositivo en GCM
  GCMDevMode: true //Define si se usan los certificados de DEV o PROD para APNS
})
