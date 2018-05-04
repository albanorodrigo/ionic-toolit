angular.module('starter')

.service('Utilidades', function ($http) {

  var utilidades = {};

  //Parsea un JSON a un Objeto javascript
  utilidades.parseJSON = function (data, headers) {
    try {
      return angular.fromJson(data);
    } catch (e) {
      //console.log("*** Error \"utilidades.parseJSON\" no se pudo parsear el JSON " + e + " ***");
      return {};
    }
    //aux.hasOwnProperty('body') //verifaicar si existe propiedad
    //return $http.defaults.transformResponse[0](data, headers);
  };

  utilidades.generateResourceURL = function (url, params, data) {
    var popFirstKey = function (object1, object2, objectN, key) {
      // Convert the arguments list into a true array so we can easily
      // pluck values from either end.
      var objects = Array.prototype.slice.call(arguments);
      // The key will always be the last item in the argument collection.
      var key = objects.pop();
      var object = null;
      // Iterate over the arguments, looking for the first object that
      // contains a reference to the given key.
      while (object = objects.shift()) {
        if (object.hasOwnProperty(key)) {
          return(popKey(object, key));
        }
      }
    }
    // I delete the key from the given object and return the value.
    var popKey = function (object, key) {
      var value = object[ key ];
      delete(object[ key ]);
      return(value);
    }
    // Make sure we have an object to work with - makes the rest of the
    // logic easier.
    params = (params || {});
    data = (data || {});
    // Strip out the delimiter fluff that is only there for readability
    // of the optional label paths.
    url = url.replace(/(\(\s*|\s*\)|\s*\|\s*)/g, "");
    // Replace each label in the URL (ex, :userID).
    url = url.replace(/:([a-z]\w*)/gi, function ($0, label) {
      // NOTE: Giving "data" precedence over "params".
      return(popFirstKey(data, params, label) || "");
    });
    // Strip out any repeating slashes (but NOT the http:// version).
    url = url.replace(/(^|[^:])[\/]{2,}/g, "$1/");
    // Strip out any trailing slash.
    url = url.replace(/\/+$/i, "");
    return(url);
  };

  return utilidades;

});