angular.module('starter')

.service('UsuarioService', function ($q, Usuario, UsuarioEstado) {

  var initOK = false;
  var usuario = $q.defer().promise;
  var estadosUsuario = $q.defer().promise;

  function init() {
    if (!initOK) {
      //AuthService.isLogged.then(function (data) {
      //console.log("******** CARGAR ESTADOS DE USUARIO ********");
      //cargarEstados();
      //});
      initOK = true;
    }
  }

  function cargarUsuario() {
    console.log("*** Cargar datos del usuario logeado ***");
    usuario = Usuario.cargar({}, function (data) {
      //guardar datos de usuario
      /*if (data) {
       data.$promise;
       }*/
    }, function (error) {
      console.log("*** Error al cargar datos del usuario logeado ***");
      //error al cargar datos de usuario
    }).$promise;
    return usuario;
  }

  function cargarEstados() {
    console.log("*** Cargar lista de estados de usuarios ***");
    estadosUsuario = UsuarioEstado.all({}, function (data) {
      console.log(data);
      /*if (data) {
       estadosUsuario = data;
       }*/
    }, function (error) {
      console.log("*** Error al cargar lista de estados de usuarios ***");
    }).$promise;
    return estadosUsuario;
  }

  function cargarEstadoUsuario(usuario) {
    if (!(usuario && usuario.idUsuario)) {
      return $q.reject("El usuario es nulo.");
    }
    console.log("*** Cargar estado usuario id: " + usuario.idUsuario + " ***");
    return Usuario.cargarEstado({id: usuario.idUsuario}).$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar estado del usuario. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar estado del usuario!");
    });
  }

  function cambiarEstadoUsuario(usuario, idEstado) {
    if (!(usuario && usuario.idUsuario)) {
      return $q.reject("El usuario es nulo.");
    }
    if (!idEstado) {
      return $q.reject("El estado es nulo.");
    }
    console.log("*** Cambiar estado usuario id: " + usuario.idUsuario + " ***");
    return Usuario.cambiarEstado({id: usuario.idUsuario, idEstado: idEstado}).$promise.then(function (data) {
      console.log(data.estado);
      return $q.resolve(data.estado);
    }, function (error) {
      console.log("*** Error al cambiar estado del usuario. ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cambiar estado del usuario!");
    });
  }

  function cargarUsuarios() {
    console.log("*** Cargar lista de usuarios ***");
    return Usuario.all().$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar lista de usuarios ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar lista de usuarios!");
    });
  }

  //TODO: correjir y hacer generico por rubro o parecido...
  function cargarTecnicos() {
    console.log("*** Cargar lista de tecnicos ***");
    return Usuario.cargarTecnicos().$promise.then(function (data) {
      console.log(data);
      return $q.resolve(data);
    }, function (error) {
      console.log("*** Error al cargar lista de tecnicos ***");
      console.log(error);
      //return $q.reject(error);
      return $q.reject((error.data) ? error.data : "Error al cargar lista de tecnicos!");
    });
  }

  function parseModulosConfig(data) {
    if (data) {
      angular.forEach(data, function (modulo, keyMudulo) {
        angular.forEach(modulo.config, function (item, keyConfig) {
          var valor = item.valor;
          if (item.tipo === "boolean") {
            valor = (valor === "1") ? true : false;
          }
          data[keyMudulo]["config"][keyConfig] = valor;
        });
      });
    }
    return data;
  }

  function getModulosCliente() {
    return $q(function (resolve, reject) {
      usuario.then(function (data) {
        resolve(parseModulosConfig(data.usuario.cliente.modulos));
      }, function (error) {
        reject(error);
      });
    });
  }

  return {
    init: init,
    getUsuario: function () {
      return usuario;
    },
    getEstados: function () {
      return estadosUsuario;
    },
    getModulosCliente: getModulosCliente,
    cargarUsuario: cargarUsuario,
    cargarUsuarios: cargarUsuarios,
    cargarEstados: cargarEstados,
    cargarEstadoUsuario: cargarEstadoUsuario,
    cambiarEstadoUsuario: cambiarEstadoUsuario,
    cargarTecnicos: cargarTecnicos
  };

})

.run(function (UsuarioService) {
  //Inicializar "UsuarioServices"
  UsuarioService.init();
})

.provider('Usuario', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(null, {id: '@id'}, {
      all: {
        url: API_URLS.usuario.listado,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      cargar: {
        url: API_URLS.usuario.cargar,
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      cargarEstado: {
        url: API_URLS.usuario.cargarEstado,
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      cambiarEstado: {
        url: API_URLS.usuario.cambiarEstado,
        method: 'PUT',
        params: {idEstado: '@idEstado'},
        transformResponse: function (data, headers) {
          if (data) {
            var aux = Utilidades.parseJSON(data, headers);
            return (aux.status === "STATUS_OK") ? {estado: aux.body} : aux.body;
          }
          return data;
        }
      },
      cargarTecnicos: {
        url: API_URLS.usuario.cargarTecnicos,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
    });

    function Usuario() {

    }

    Usuario.all = metodos.all;
    Usuario.cargar = metodos.cargar;
    Usuario.cargarEstado = metodos.cargarEstado;
    Usuario.cambiarEstado = metodos.cambiarEstado;
    Usuario.cargarTecnicos = metodos.cargarTecnicos;
    return Usuario;
  };

})

.provider('UsuarioEstado', function () {

  this.$get = function ($resource, Utilidades, API_URLS) {

    var metodos = $resource(API_URLS.usuario.estados.detalle, {id: '@id'}, {
      get: {
        method: 'GET',
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      },
      all: {
        url: API_URLS.usuario.estados.listado,
        method: 'GET',
        isArray: true,
        transformResponse: function (data, headers) {
          return (data) ? Utilidades.parseJSON(data, headers)['body'] : data;
        }
      }
    });

    function UsuarioEstado() {

    }

    UsuarioEstado.get = metodos.get;
    UsuarioEstado.all = metodos.all;
    return UsuarioEstado;
  };

});
