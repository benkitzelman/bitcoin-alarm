var View = function() {

  function View(model) {
    this.tagName = 'div';
    this.model   = model;
    this.el      = document.createElement(this.tagName);
  };

  View.prototype.render = function() {
    this.el.innerHTML = '';
    return this;
  };

  return View;
}();

var ThresholdView = function() {
  extend(ThresholdView.prototype, View.prototype);

  function ThresholdView() {
    View.prototype.constructor.apply(this, arguments);
  };

  ThresholdView.prototype.template = function(threshold) {
    var dropdownFor = function(hash, selection) {
      var str ='<select class="point">';
      for(var key in hash){
        var isSelected = hash[key] == selection || key == selection;
        str += '<option value="'+ key +'" '+ (isSelected ? 'selected' : '')+'>'+hash[key]+'</option>'
      }
      return str + '</select>';
    };

    return '\
      <div class="control-group">\
        <label class="control-label">The '+ dropdownFor(POINTS, threshold.pricePoint.point) +'\
          price is ' + dropdownFor(OPERATION, threshold.operation) +':</label>\
        <div class="controls">\
          <div class="input-prepend">\
            <span class="add-on">$</span>\
            <input type="text" placeholder="AUD" id="marker_loss" value="'+ threshold.pricePoint.toString(false) +'" />\
          </div>\
        </div>\
      </div>';
  };

  ThresholdView.prototype.render = function() {
    this.el.innerHTML = this.template(this.model);
    return this;
  };

  return ThresholdView;
}();