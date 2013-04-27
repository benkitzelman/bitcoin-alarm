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
    var dropdownFor = function(hash, selection, css) {
      var str ='<select class="facet '+ (css || '') +'">';
      for(var key in hash){
        var isSelected = hash[key] == selection || key == selection;
        str += '<option value="'+ key +'" '+ (isSelected ? 'selected' : '')+'>'+hash[key]+'</option>'
      }
      return str + '</select>';
    };

    return '\
      <div class="control-group">\
        <span class="mark"></span> \
          The ' + dropdownFor(POINTS, threshold.pricePoint.point, 'points') +'\
          price is '    + dropdownFor(OPERATION, threshold.operation, 'operation')  +'\
          <div class="threshold-value input-prepend">\
            <span class="add-on">$</span>\
            <input type="text" placeholder="AUD" class="price_threshold" value="' + threshold.pricePoint.toString(false) +'" />\
          </div>\
      </div>';
  };

  ThresholdView.prototype.highlight = function() {
    var mark = this.el.querySelector('.mark');
    mark.innerHTML = ' ** ';
  };

  ThresholdView.prototype.bindEvents = function() {
    var _this = this;

    this.el.querySelector('input').addEventListener('change', function() {
      var newAmt = _this.el.querySelector('input').value;
      _this.model.pricePoint.value = newAmt;
    });

    this.el.querySelector('.points').addEventListener('change', function() {
      var newPoint = _this.el.querySelector('.points').value;
      _this.model.pricePoint.point = newPoint;
    });

    this.el.querySelector('.operation').addEventListener('change', function() {
      var newOp = _this.el.querySelector('.operation').value;
      _this.model.operation = OPERATION[newOp];
    });
  };

  ThresholdView.prototype.render = function() {
    // Memory leaks... whoohoo
    this.el.innerHTML = this.template(this.model);
    this.bindEvents();
    return this;
  };

  return ThresholdView;
}();