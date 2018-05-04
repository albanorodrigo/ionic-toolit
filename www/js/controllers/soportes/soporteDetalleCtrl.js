angular.module('starter')

.controller('SoporteDetalleCtrl', function ($rootScope, $scope, $state, $stateParams, $q, $http, $timeout, $ionicPopover, $ionicModal, $ionicPopup, $ionicActionSheet, $cordovaCamera, $cordovaFileTransfer, UsuarioService, SoporteService, BroadcastService, Utilidades, APP_EVENTS, APP_STATES, API_URLS) {

  /*
   * TODO: pasar las funciones genericas del soporte (iniciar, cerrar, cargar) 
   * a soporteCtrl para que se puedan utilizar de otros controllers 
   * y no unicamente en este. 
   */

  $scope.soporte = null;
  $scope.soporteNotas = [];
  $scope.soporteArchivos = [];
  $scope.soporteLoaded = $q.defer();
  $scope.soporteEstadoSelect = {value: null};
  $scope.soporteEstadoCierreSelect = {value: null};
  $scope.soporteNotaTextarea = {value: null};
  $scope.signatureCanvas = {};
  $scope.signaturePad = {};
  $scope.signature = null;
  $scope.floatMenuState = "closed";
  $scope.mostrarMasDetalles = false;
  $scope.mostrarContactos = false;
  $scope.adminSoportesActive = false;

  function registrarEventos() {
    $scope.$on('$ionicView.afterEnter', function () {
      //Se ejecuta luego de cargar la vista y el soporte
      $scope.soporteLoaded.promise.then(function () {
        //Marcar soporte como leido
        soporteLeido($scope.soporte);
        //Marcar notificaciones del soporte como leidas
        notificacionesLeidas($scope.soporte);
      });
    });
    BroadcastService.registrar($rootScope, APP_EVENTS.soporte.modificado, function (event, data) {
      if ($scope.soporte && data && data.idSoporte) {
        if ($scope.soporte.idSoporte === data.idSoporte) {
          //Se acaba de modificar el soporte (actualizar)
          actualizarSoporte(data);
        }
      }
    });
    BroadcastService.registrar($rootScope, APP_EVENTS.soporte.eliminado, function (event, data) {
      if ($scope.soporte && data && data.idSoporte) {
        if ($scope.soporte.idSoporte === data.idSoporte) {
          //Se acaba de eliminar el soporte...
          redirectToListadoSoportes();
        }
      }
    });
  }

  //Carga un soporte para la vista "detalle"
  function cargarDatosSoporte(idSoporte) {//Verificar si ya se cargo el usuario...
    UsuarioService.getUsuario().then(function () {
      if (idSoporte) {
        $scope.adminSoportesActive = SoporteService.isAdminSoportes();
        $scope.showLoader($scope, "Cargando soporte...", "SoporteDetalleCtrl:cargarSoporte");
        return cargarSoporte(idSoporte).then(function (data) {
          if (data) {
            //Cargar notas del soporte
            cargarNotas(idSoporte);
            //Cargar archivos del soporte
            cargarArchivos(idSoporte);
          }
        }, function (error) {
          console.log(error);
          if (error.message) {
            //$scope.showAlert('ERROR', error.message);
          }
        }).finally(function () {
          $scope.hideLoader($scope, "SoporteDetalleCtrl:cargarSoporte");
        });
      }
      return $q.reject("El id del soporte a cargar es nulo");
    });
  }

  function cargarSoporte(idSoporte) {
    $scope.soporteLoaded = $q.defer();
    var isSupervisor = $scope.checkSupervisionSoportes();
    return SoporteService.cargarSoporte(idSoporte, isSupervisor).then(function (data) {
      actualizarSoporte(data);
      $scope.soporteLoaded.resolve(data);
      return $q.resolve(data);
    }, function (error) {
      $scope.soporteLoaded.reject(error);
      return $q.reject(error);
    });
  }

  function redirectToListadoSoportes() {
    $state.go(APP_STATES.soportes.listado);
  }

  function actualizarSoporte(soporte) {
    if (soporte) {
      //actualiza la propiedad del soporte actual
      $scope.soporte = soporte;
      //Asigna el estado actual del soporte para el combo
      $scope.soporteEstadoSelect.value = soporte.idEstadoSoporte;
    }
  }

  //Carga las notas del soporte
  function cargarNotas(idSoporte) {
    if (idSoporte) {
      $scope.showLoader($scope, "Cargando notas...", "SoporteDetalleCtrl:cargarNotas");
      return SoporteService.cargarNotas(idSoporte).then(function (data) {
        $scope.soporteNotas = data;
      }, function (error) {
        console.log(error);
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
      }).finally(function () {
        $scope.hideLoader($scope, "SoporteDetalleCtrl:cargarNotas");
      });
    }
  }

  //Carga los archivos del soporte
  function cargarArchivos(idSoporte) {
    if (idSoporte) {
      $scope.showLoader($scope, "Cargando archivos...", "SoporteDetalleCtrl:cargarArchivos");
      return SoporteService.cargarArchivos(idSoporte).then(function (data) {
        $scope.soporteArchivos = data;
      }, function (error) {
        console.log(error);
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
      }).finally(function () {
        $scope.hideLoader($scope, "SoporteDetalleCtrl:cargarArchivos");
      });
    }
  }

  function soporteLeido(soporte) {
    var usuarioOk = $scope.checkSoporteAsignadoUsuarioOrSinAsignar(soporte);
    if (soporte && !soporte.tsNotificacionLeida && !$scope.adminSoportesActive && usuarioOk) {
      return SoporteService.soporteLeido(soporte).promise;
    }
    return $q.resolve(false);
  }

  function notificacionesLeidas(soporte) {
    var usuarioOk = $scope.checkSoporteAsignadoUsuario(soporte);
    if (soporte && !$scope.adminSoportesActive && usuarioOk) {
      return SoporteService.notificacionesLeidas(soporte.idSoporte).promise;
    }
    return $q.resolve(false);
  }

  function iniciarSoporte(soporte) {
    if (soporte) {
      $scope.showLoader($scope, "Iniciando soporte...");
      return SoporteService.iniciarSoporte(soporte).then(function (data) {
        return $q.resolve(data);
      }, function (error) {
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
        return $q.reject(error);
      }).finally(function () {
        $scope.hideLoader($scope);
      });
    }
  }

  function cerrarSoporte(soporte) {
    //console.log("*** CERRAR SOPORTE FORM MODEL ***");
    //console.log($scope.formularioCierreData);
    //console.log(angular.toJson($scope.signature));
    if (soporte) {
      $scope.showLoader($scope, "Cerrando soporte...");
      return SoporteService.cerrarSoporte(soporte, $scope.soporteEstadoCierreSelect.value, $scope.formularioCierreData).then(function (data) {
        $scope.formularioCierreData.reset();
        $scope.hideModalCerrarSoporte();
      }, function (error) {
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
      }).finally(function () {
        $scope.hideLoader($scope);
      });
    }
  }

  function initSignaturePad() {
    var canvas = document.getElementById('signature-canvas');
    var options = {
      backgroundColor: '#FFF',
      penColor: '#000',
      onEnd: function () {
        if (!$scope.signaturePad.isEmpty()) {
          $scope.signature = $scope.signaturePad.toDataURL(); //"image/jpeg"
          $scope.formularioCierreData.setFirmaFromDataURL($scope.signature);
        }
      }
    };
    $scope.signatureCanvas = canvas;
    $scope.signaturePad = new SignaturePad(canvas, options);
    /*if ($scope.signature) {
     $scope.signaturePad.fromDataURL($scope.signature);
     $scope.formularioCierreData.setFirmaFromDataURL($scope.signature);
     }*/
    resizeSignaturePad();
    /*window.onresize = function () {
     resizeSignaturePad();
     };*/
  }

  function resizeSignaturePad() {
    var ratio = 1;
    //var ratio = Math.max(window.devicePixelRatio || 1, 1);
    //var data = $scope.signaturePad.toDataURL();
    $scope.signatureCanvas.width = $scope.signatureCanvas.offsetWidth * ratio;
    $scope.signatureCanvas.height = $scope.signatureCanvas.offsetHeight * ratio;
    $scope.signatureCanvas.getContext("2d").scale(ratio, ratio);
    //$scope.signaturePad.fromDataURL(data);
  }

  function cambiarEstadoSoporte(soporte) {
    if (soporte) {
      var idEstado = $scope.soporteEstadoSelect.value;
      $scope.showLoader($scope, "Cambiando estado...");
      console.log("*** ASIGNAR ESTADO: ****");
      console.log(idEstado);
      return SoporteService.cambiarEstadoSoporte(soporte, idEstado).then(function (data) {
        $scope.hideModalEstadoSoporte();
      }, function (error) {
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
        if ($scope.soporte) {
          $scope.soporteEstadoSelect.value = $scope.soporte.idEstadoSoporte;
        }
      }).finally(function () {
        $scope.hideLoader($scope);
      });
    }
  }

  function tomarFoto() {
    document.addEventListener("deviceready", function () {

      var options = {
        //destinationType: Camera.DestinationType.DATA_URL,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        quality: 50,
        allowEdit: false,
        //targetWidth: 1024,
        //targetHeight: 768,
        //popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };

      console.log("*** TOMAR FOTO -> CAMERA -> getPicture");

      $cordovaCamera.getPicture(options).then(function (imageData) {
        //var image = document.getElementById('myImage');
        //image.src = "data:image/jpeg;base64," + imageData;
        //alert(imageData);
        //$scope.fotoActualData = "data:image/jpeg;base64," + imageData;
        console.log("*** CAMERA PLUGIN OK");
        $scope.fotoActualData = imageData;
        console.log("*** CAMERA PLUGIN IMAGE DATA "+imageData);
        $scope.agregarArchivo($scope.soporte, imageData);
        console.log("*** CAMERA PLUGIN OK - despues agregar archivo");
        $cordovaCamera.cleanup().then(function () {
          console.log("*** CAMERA PLUGIN CLEAN");
        });
      }, function (err) {
        console.log("*** CAMERA PLUGIN ERROR");
        console.log(err);
        $cordovaCamera.cleanup().then(function () {
          //clean success
        });
      });

//      $cordovaCamera.cleanup().then(function () {
//        //clean success
//      });

    }, false);
  }

  function seleccionarFoto() {
    document.addEventListener("deviceready", function () {
      var options = {
        //destinationType: Camera.DestinationType.DATA_URL,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        //popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
      };

      $cordovaCamera.getPicture(options).then(function (imageData) {
        //var image = document.getElementById('myImage');
        //image.src = "data:image/jpeg;base64," + imageData;
        //alert(imageData);
        //$scope.fotoActualData = "data:image/jpeg;base64," + imageData;
        $scope.fotoActualData = imageData;
        $scope.agregarArchivo($scope.soporte, imageData);
      }, function (err) {
        // error
      });

      // Reposition the popover if the orientation changes. 
      window.onorientationchange = function () {
        //var cameraPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY);
        //cameraPopoverHandle.setPosition(cameraPopoverOptions);
      };
    }, false);
  }

  $scope.pullToRefresh = function () {
    $timeout(function () {
      $scope.$broadcast('scroll.refreshComplete');
    }, 1500);
  };

  $scope.limpiarSignaturePad = function () {
    $ionicPopup.confirm({
      title: 'Limpiar firma',
      template: '¿Seguro desea limpiar la firma?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        $scope.signaturePad.clear();
        $scope.signature = null;
        $scope.formularioCierreData.setFirmaFromDataURL($scope.signature);
      }
    });
  };

  $scope.guardarSignaturePad = function () {
    //$scope.signature = $scope.signaturePad.toDataURL();
    //$scope.signature = $scope.signaturePad.toDataURL("image/jpeg");
    //var data = $scope.signaturePad.toDataURL('image/jpeg');
    var data = $scope.signaturePad.toDataURL();

    // Send data to server instead...
    window.open(data);
  };

  $scope.iniciarSoporte = function (soporte) {
    $ionicPopup.confirm({
      title: 'Iniciar soporte',
      template: '¿Seguro desea iniciar el soporte?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        iniciarSoporte(soporte);
      }
    });
  };

  $scope.cerrarSoporte = function (soporte) {
    $ionicPopup.confirm({
      title: 'Cerrar soporte',
      template: '¿Seguro desea cerrar el soporte?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        cerrarSoporte(soporte);
      }
    });
  };

  $scope.cambiarEstadoSoporte = function (soporte, confirm) {
    var fn = function () {
      //console.log("*** NUEVO ESTADO ***");
      //console.log($scope.soporteEstadoSelect);
      cambiarEstadoSoporte(soporte);
    };
    if (confirm) {
      $ionicPopup.confirm({
        title: 'Cambiar estado',
        template: '¿Seguro desea cambiar el estado del soporte?',
        okText: 'Si',
        okType: 'button-balanced',
        cancelText: 'Cancelar',
        cancelType: 'button-assertive'
      }).then(function (isOK) {
        if (isOK) {
          fn();
        }
      });
    } else {
      fn();
    }
  };

  $scope.showMapaSoporte = function () {
    if ($scope.soporte && $scope.soporte.idSoporte) {
      if ($scope.soporte.lugar && $scope.soporte.lugar.lat && $scope.soporte.lugar.lng) {
        $state.go(APP_STATES.mapa, {soporte: $scope.soporte});
      } else {
        $scope.showAlert('Imposible geolocalizar', 'No se establecieron las coordenadas para el lugar');
      }
    }
  };

  $scope.showInfoAbonado = function () {
    if ($scope.soporte && $scope.soporte.idSoporte) {
      if ($scope.soporte.abonado) {
        var abonado = $scope.soporte.abonado;
        var lugar = $scope.soporte.lugar;
        $state.go(APP_STATES.abonados.tabs, {abonadoId: abonado.idAbonado, lugar: lugar});
      } else {
        $scope.showAlert('Abonado no disponible', 'No hay un abonado asignado al soporte');
      }
    }
  };

  $scope.showFotosSoporte = function () {
    if ($scope.soporte && $scope.soporte.idSoporte) {
      $state.go(APP_STATES.soportes.fotos, {soporteId: $scope.soporte.idSoporte});
    }
  };

  // Crea la ventana modal para cerrar un soporte
  $ionicModal.fromTemplateUrl('templates/soportes/soportes-cerrar.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalCerrarSoporte = modal;
  });

  $scope.showModalCerrarSoporte = function () {
    if ($scope.modalCerrarSoporte) {
      $scope.modalCerrarSoporte.show().then(function (data) {
        initSignaturePad();
      });
    }
  };

  $scope.hideModalCerrarSoporte = function () {
    if ($scope.modalCerrarSoporte) {
      $scope.modalCerrarSoporte.hide();
    }
  };

  // Crea la ventana modal para cambiar el estado del soporte
  $ionicModal.fromTemplateUrl('templates/soportes/soportes-estado.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalEstadoSoporte = modal;
  });

  $scope.showModalEstadoSoporte = function () {
    var error = false;
    var errorMsg = "";
    if ($scope.soporte) {
      if (!$scope.soporte.idUsuarioAsignado) {
        error = true;
        errorMsg = "No puede cambiar el estado de un soporte que no fue asignado";
      } else if (!$scope.checkSoporteAsignadoUsuario($scope.soporte)) {
        error = true;
        errorMsg = "No puede cambiar el estado de un soporte que no le pertenece";
      }
    }
    if (error) {
      $scope.showAlert("Accion denegada!", errorMsg);
    } else {
      if ($scope.modalEstadoSoporte) {
        $scope.modalEstadoSoporte.show();
      }
    }
  };

  $scope.hideModalEstadoSoporte = function () {
    if ($scope.modalEstadoSoporte) {
      $scope.modalEstadoSoporte.hide();
    }
  };

  // Crea la ventana modal para las notas del soporte
  $ionicModal.fromTemplateUrl('templates/soportes/soportes-nota.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modalNotaSoporte = modal;
  });

  $scope.showModalNotaSoporte = function () {
    if ($scope.modalNotaSoporte) {
      $scope.modalNotaSoporte.show();
    }
  };

  $scope.hideModalNotaSoporte = function () {
    if ($scope.modalNotaSoporte) {
      $scope.modalNotaSoporte.hide();
    }
  };

  $scope.agregarNota = function () {
    if ($scope.soporte && $scope.soporteNotaTextarea) {
      var nota = $scope.soporteNotaTextarea.value;
      $scope.showLoader($scope, "Guardando nota...");
      return SoporteService.agregarNota($scope.soporte, nota).then(function (data) {
        cargarNotas($scope.soporte.idSoporte);
        $scope.soporteNotaTextarea.value = null;
        $scope.hideModalNotaSoporte();
      }, function (error) {
        if (error.message) {
          //$scope.showAlert('ERROR', error.message);
        }
      }).finally(function () {
        $scope.hideLoader($scope);
      });
    }
  };

  $scope.limpiarCampoNota = function () {
    $ionicPopup.confirm({
      title: 'Limpiar nota',
      template: '¿Seguro desea limpiar el campo de nota?',
      okText: 'Si',
      okType: 'button-balanced',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive'
    }).then(function (isOK) {
      if (isOK) {
        $timeout(function () {
          $scope.soporteNotaTextarea.value = "";
        });
      }
    });
  };

  $scope.agregarArchivo = function (soporte, filePath) {
    //TODO: implementar promesas para la carga de archivos
    if (!soporte || !soporte.idSoporte || !filePath) {
      return false;
    }
    console.log("*** FILE TRANSFER -> "+filePath);
    document.addEventListener('deviceready', function () {
      //Generar url de carga
      var urlAPI = API_URLS.soporte.archivos.cargar;
      var url = Utilidades.generateResourceURL(urlAPI, {id: soporte.idSoporte});
      //Agregar token y opciones
      var options = {
        fileKey: "file",
        headers: {
          Authorization: $http.defaults.headers.common.Authorization,
          "X-Api-Version": $http.defaults.headers.common["X-Api-Version"]
        }
      };
      //Cargar archivo...
      $cordovaFileTransfer.upload(url, filePath, options).then(function (result) {
        // Success!
        console.log("*** FILE TRANSFER -> SUCCESS ***");
        console.log(angular.toJson(result));
        $scope.hideProgress();
        $scope.showAlert("Archivo cargado", "El archivo se cargo correctamente.");
      }, function (err) {
        // Error
        console.log("*** FILE TRANSFER -> ERROR ***");
        console.log(angular.toJson(err));
        var status = "";
        var message = "";
        if (err.http_status != undefined) {
          status = err.http_status;
        }
        if (err.body.message != undefined) {
          message = err.body.message;
        }
        $scope.hideProgress();
        $scope.showAlert("ERROR!", "Ocurrió un error al cargar el archivo:\n"+status+"  "+message);
      }, function (progress) {
        // constant progress updates
        console.log("*** FILE TRANSFER -> PROGRESS ***");
        console.log(angular.toJson(progress));
        $scope.showProgress((progress.loaded / progress.total) * 100);
//        $timeout(function () {
//          $scope.uploadProgress = (progress.loaded / progress.total) * 100;
//        });
      });
    }, false);
  };

  // Crea popover de acciones para el soporte
  $ionicPopover.fromTemplateUrl('templates/soportes/soportes-acciones.html', {
    scope: $scope,
    backdropClickToClose: true,
    hardwareBackButtonClose: true
  }).then(function (popover) {
    $scope.popoverAccionesSoporte = popover;
  });

  $scope.showAccionesSoporte = function ($event) {
    if ($scope.popoverAccionesSoporte) {
      $scope.popoverAccionesSoporte.show($event);
    }
  };

  $scope.hideAccionesSoporte = function () {
    if ($scope.popoverAccionesSoporte) {
      $scope.popoverAccionesSoporte.hide();
    }
  };

  // Triggered on a button click, or some other target
  $scope.showActionSheetFoto = function () {
    var sheetOptions = {
      buttons: [
        {text: '<i class="icon ion-camera"></i>Hacer una foto'},
        {text: '<i class="icon ion-images"></i>Desde la galeria'}
      ],
      titleText: 'Adjuntar una foto',
      cancelText: '<i class="icon ion-android-close"></i>Cancelar',
      cancel: function () {
        //...
      },
      buttonClicked: function (index) {
        switch (index) {
          case 0:
            tomarFoto();
            break;
          case 1:
            seleccionarFoto();
            break;
        }
        return true;
      }
    };
    // Show the action sheet
    var sheetHide = $ionicActionSheet.show(sheetOptions);
    // For example's sake, hide the sheet after two seconds
    /*$timeout(function () {
     sheetHide();
     }, 2000);*/
  };

  $scope.showFloatMenu = function () {
    $scope.floatMenuState = "open";
  };

  $scope.hideFloatMenu = function () {
    $scope.floatMenuState = "closed";
  };

  $scope.toggleMostrarMasDetalles = function () {
    $scope.mostrarMasDetalles = !$scope.mostrarMasDetalles;
  };

  $scope.toggleContactos = function () {
    $scope.mostrarContactos = !$scope.mostrarContactos;
  };

  //Cerrar ventana al salir de la vista...
  $rootScope.$on("$ionicView.beforeLeave", function () {
    $scope.hideModalCerrarSoporte();
    $scope.hideModalEstadoSoporte();
    $scope.hideAccionesSoporte();
    $scope.hideModalNotaSoporte();
  });

  //Destroy controller
  $scope.$on('$destroy', function () {
    if ($scope.modalCerrarSoporte) {
      $scope.modalCerrarSoporte.remove();
    }
    if ($scope.modalEstadoSoporte) {
      $scope.modalEstadoSoporte.remove();
    }
    if ($scope.popoverAccionesSoporte) {
      $scope.popoverAccionesSoporte.remove();
    }
    if ($scope.modalNotaSoporte) {
      $scope.modalNotaSoporte.remove();
    }
  });

  //Cargar soporte seleccionado
  cargarDatosSoporte($stateParams.soporteId);
  registrarEventos();

});