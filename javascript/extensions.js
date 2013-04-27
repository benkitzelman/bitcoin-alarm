window.extend = function(obj) {
  var extensions = Array.prototype.slice.call(arguments, 1);
  for(var i=0; i < extensions.length; i++) {
    var source;

    if (source = extensions[i]) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
};
