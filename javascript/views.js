var View = function() {

  function View(model) {
    this.tagName = 'div';
    this.model   = model;
    this.el      = document.createElement(this.tagName);
  };

  View.prototype.$ = function() {
    var args = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
    args.push(this.el);
    return $.apply(window, args);
  };

  View.prototype.remove = function() {
    if(this.unbindEvents) this.unbindEvents();
    this.el.remove();
    delete this;
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
          The ' + dropdownFor(POINTS, threshold.pricePoint.point, 'points') +'\
          price is '    + dropdownFor(OPERATION, threshold.operation, 'operation')  +'\
          <div class="threshold-value input-prepend">\
            <span class="add-on">$</span>\
            <input type="text" placeholder="AUD" class="price_threshold" value="' + threshold.pricePoint.toString(false) +'" />\
          </div>\
          <button class="delete btn">X</button>\
      </div>';
  };

  ThresholdView.prototype.highlight = function() {
    var mark = this.$('.control-group').addClass('highlight');
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

    this.el.querySelector('.delete.btn').addEventListener('click', function(e) {
      e.preventDefault();
      _this.remove();
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