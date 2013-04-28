  var TradeMonitor = function() {

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
      $('.highlight').removeClass('highlight');
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

    this.thresholds = function() {
      var models = [];
      this.thresholdViews.forEach(function(v) {
        models.push(v.model);
      });
      return models;
    };

    this.viewFor = function(threshold) {
      for(var i=0; i < this.thresholdViews.length; i++) {
        var v = this.thresholdViews[i];
        if(v.model == threshold) return v;
      }
    };

    this.addThreshold = function() {
      var container = document.getElementById('thresholds');
      var p = new PriceThreshold(this, OPERATION.lte, new PricePoint('avg', 0));
      var v = new ThresholdView(p);

      this.thresholdViews.push(v);
      if(container.children.length) {
        var conjunction = document.createElement('div');
        conjunction.className = 'logical-or control-group';
        conjunction.innerHTML = 'OR'
        container.appendChild(conjunction);
      }
      container.appendChild(v.render().el);
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

    var signalActivity = function(msg, persistent) {
      $('#activity-message').html(msg);
      var activity = $('#activity-monitor').addClass('pulse');
      if(persistent) return;
      setTimeout(function() { activity.removeClass('pulse'); }, 200);
    };

    var onConnect = function() {
      log('Connected', arguments);
      signalActivity('connected');
    };

    var onDisconnect = function() {
      log('Disconnected', arguments);
    };

    var onError = function() {
      log('Error', arguments);
      signalActivity('error');
    };

    var onMessage = function(data) {
      log('Message', arguments);

      signalActivity(data.private);
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

      this.ticker = data.ticker;
      alertIfNecessary();
      this.price.innerHTML  = format(this.ticker.avg);
      this.last.innerHTML   = format(this.ticker.last);
      this.high.innerHTML   = format(this.ticker.high);
      this.low.innerHTML    = format(this.ticker.low);
      this.volume.innerHTML = this.ticker.vol.display;
      this.buy.innerHTML    = format(this.ticker.buy);
      this.sell.innerHTML   = format(this.ticker.sell);
    };

    var alertIfNecessary = function() {
      if(!this.isAlarmSet()) return;
      var thresholds = this.thresholds();

      for(var i = 0; i < thresholds.length; i++) {
        var t = thresholds[i];
        if(t.isMet()) {
          this.playSound('loss');
          this.viewFor(t).highlight();
          return;
        }
      }
    };

    var bindToDom = function() {
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

      this.addThresholdBtn.addEventListener('click', function(e){
        e.preventDefault();
        _this.addThreshold();
      });
    };

    // initialize
    this.loggingEnabled = false;
    this.soundsEnabled  = false;
    this.thresholdViews = [];

    this.price = document.getElementById('price');
    this.buy   = document.getElementById('buy');
    this.sell  = document.getElementById('sell');
    this.high  = document.getElementById('high');
    this.last  = document.getElementById('last');
    this.low   = document.getElementById('low');

    this.depth  = document.getElementById('depth');
    this.trades = document.getElementById('trades');

    this.stopAlarmBtn     = document.getElementById('stop_alarm_btn');
    this.setAlarmBtn      = document.getElementById('set_alarm_btn');
    this.addThresholdBtn  = document.getElementById('add_threshold_btn');

    this.sounds = {
      profit: new Audio('assets/audio/profit.mp3'),
      loss:   new Audio('assets/audio/loss.mp3')
    };

    this.addThreshold();
    bindToDom();

    signalActivity('connecting', true);
    this.conn = io.connect('https://socketio.mtgox.com/mtgox?Currency=AUD');

    conn.on('connect',    onConnect);
    conn.on('disconnect', onDisconnect);
    conn.on('error',      onError);
    conn.on('message',    onMessage);
    return this;
  };