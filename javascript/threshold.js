var POINTS = {
  avg:  'Avg',
  buy:  'Buy',
  sell: 'Sell',
  last: 'Last',
  high: 'High',
  low:  'Low',
  vol:  'Volume'
};

var OPERATION = {
  eq: '==',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=' 
};

var Threshold = function() {

  function Threshold(monitor, operation) {
    this.monitor   = monitor;
    this.operation = operation || OPERATION.eq;
  };

  Threshold.prototype.compare = function(numberA, numberB) {
    switch(this.operation) {
      case OPERATION.eq:
        return numberA == numberB;

      case OPERATION.gt:
        return numberA > numberB;

      case OPERATION.gte:
        return numberA >= numberB;
  
      case OPERATION.lt:
        return numberA < numberB;

      case OPERATION.lte:
        return numberA <= numberB;

      default:
        return false;
    }
  };

  Threshold.prototype.isMet = function() {
    return false;
  };

  return Threshold;
}();


var PriceThreshold = function() {
  extend(PriceThreshold.prototype, Threshold.prototype);

  function PriceThreshold(monitor, operation, pricePoint) {
    Threshold.prototype.constructor.apply(this, arguments);
    this.pricePoint = pricePoint;
  };

  PriceThreshold.prototype.isMet = function() {
    var current;
    if(!this.monitor.ticker || !(current = this.monitor.ticker[this.pricePoint.point])) return false;
    return this.compare(parseFloat(current.value), parseFloat(this.pricePoint.value));
  };

  return PriceThreshold;
}();

var PricePoint = function() {
  function PricePoint(point, amt) {
    this.point = point;
    this.value = amt;
  };

  PricePoint.prototype.toString = function(toFullString) {
    var priceOnly = function(amt) {
      return "" + Number(amt).toFixed(4);
    };

    if(toFullString) return this.point + " " + "$" + priceOnly(this.value);
    return priceOnly(this.value);
  };

  return PricePoint;
}();