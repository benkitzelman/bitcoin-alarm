  var TradeMonitor = function() {

    this.loggingEnabled = false;
    this.soundsEnabled  = false;

    this.price = document.getElementById('price');
    this.buy   = document.getElementById('buy');
    this.sell  = document.getElementById('sell');
    this.high  = document.getElementById('high');
    this.last  = document.getElementById('last');
    this.low   = document.getElementById('low');

    this.depth  = document.getElementById('depth');
    this.trades = document.getElementById('trades');

    this.stopAlarmBtn = document.getElementById('stop_alarm_btn');
    this.setAlarmBtn  = document.getElementById('set_alarm_btn');
    this.sounds = {
      profit: new Audio('assets/audio/profit.mp3'),
      loss:   new Audio('assets/audio/loss.mp3')
    };

    var _this = this;
    this.stopAlarmBtn.style.display = 'none';
    this.stopAlarmBtn.addEventListener('click', function(e){
      e.preventDefault();
      _this.stopAlarm();

      stopAlarmBtn.style.display = 'none';
      setAlarmBtn.style.display  = 'inline-block';
    });

    this.setAlarmBtn.addEventListener('click', function(e){
      e.preventDefault();
      _this.setAlarm();

      stopAlarmBtn.style.display = 'inline-block';
      setAlarmBtn.style.display  = 'none';
    });

    this.setAlarm = function() {
      this.soundsEnabled = true;
    };

    this.stopAlarm = function() {
      this.soundsEnabled = false;
      for(var snd in this.sounds) {
        if(!this.sounds[snd]) continue;
        this.sounds[snd].pause();
        this.sounds[snd].removeEventListener('ended', this.loop);
      }
    };

    this.isAlarmSet = function () {
      return this.soundsEnabled;
    };

    this.playSound = function(snd) {
      if(!this.soundsEnabled) return;
      this.sounds[snd].play();

      this.sounds[snd].addEventListener('ended', this.loop = function() {
          this.currentTime = 0;
          this.play();
      }, false);
    };

    var logTo = function(logEl, title, message) {
      var l = logEl.children.length;

      if(l >= 30) logEl.children[l - 1].remove();
      lbl = title == 'ask' ? 'info' : 'warning';
      logEl.innerHTML = "<li><label class='label label-"+ lbl +"'>" + title + "</label><span>" + message + "</span></li>" + logEl.innerHTML;
    };

    var log = function() {
      if(!this.loggingEnabled) return;
      console.log.apply(console, arguments);
    };

    var onConnect = function() {
      log('Connected', arguments);
    };

    var onDisconnect = function() {
      log('Disconnected', arguments);
    };

    var onError = function() {
      log('Error', arguments);
    };

    var onMessage = function(data) {
      log('Message', arguments);

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
      var lossMarker   = parseFloat(document.getElementById('marker_loss').value);
      var profitMarker = parseFloat(document.getElementById('marker_profit').value);

      if(lossMarker   >= ticker.avg.value) this.playSound('loss');
      if(profitMarker <= ticker.avg.value) this.playSound('profit');
    };

    this.conn = io.connect('https://socketio.mtgox.com/mtgox?Currency=AUD');

    conn.on('connect',    onConnect);
    conn.on('disconnect', onDisconnect);
    conn.on('error',      onError);
    conn.on('message',    onMessage);
    return this;
  };