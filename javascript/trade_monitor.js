  var TradeMonitor = function() {
    
    this.price = document.getElementById('price');
    this.buy   = document.getElementById('buy');
    this.sell  = document.getElementById('sell');
    this.high  = document.getElementById('high');
    this.last  = document.getElementById('last');
    this.low   = document.getElementById('low');

    this.depth  = document.getElementById('depth');
    this.trades = document.getElementById('trades');

    this.sounds = {
      sell: new Audio('assets/audio/sell.mp3'),
      buy:  new Audio('assets/audio/buy.mp3')
    };

    var logTo = function(logEl, title, message) {
      logEl.innerHTML = "<li><label>" + title + "</label><span>" + message + "</span></li>" + logEl.innerHTML;
    };

    var onConnect = function() {
      console.log('Connected', arguments);
    };

    var onDisconnect = function() {
      console.log('Disconnected', arguments);
    };

    var onError = function() {
      console.log('Error', arguments);
    };

    var onMessage = function(data) {
      console.log('Message', arguments);

      if(data.ticker) updateHeader(data);
      if(data.depth)  updateDepth(data);
      if(data.trade)  updateTrades(data);
    };

    var updateDepth = function(data) {
      var format = function(amt) {
        return '$' + amt + ' ' + data.depth.currency;
      };

      logTo(this.depth, data.depth.type_str, format(data.depth.price));
    };

    var updateTrades = function(data) {
      var format = function(amt) {
        return '$' + amt + ' ' + data.trade.price_currency;
      };

      logTo(this.trades, data.trade.trade_type, format(data.trade.price));
    };

    var updateHeader = function(data) {
      var format = function(amt) {
        return '$' + amt.value + ' ' + amt.currency;
      };

      alertIfNecessary(data.ticker);
      this.price.innerHTML  = format(data.ticker.avg);
      this.last.innerHTML   = format(data.ticker.last);
      this.high.innerHTML   = format(data.ticker.high);
      this.low.innerHTML    = format(data.ticker.low);
      this.volume.innerHTML = data.ticker.vol.display;
      this.buy.innerHTML    = format(data.ticker.buy);
      this.sell.innerHTML   = format(data.ticker.sell);
    };

    var alertIfNecessary = function(ticker) {
      var buyAt  = parseFloat(document.getElementById('marker_buy').value);
      var sellAt = parseFloat(document.getElementById('marker_sell').value);

      if(buyAt  <= ticker.avg.value) this.sounds.buy.play();
      if(sellAt >= ticker.avg.value) this.sounds.sell.play();
    };

    this.conn = io.connect('https://socketio.mtgox.com/mtgox');

    conn.on('connect',    onConnect);
    conn.on('disconnect', onDisconnect);
    conn.on('error',      onError);
    conn.on('message',    onMessage);
  };