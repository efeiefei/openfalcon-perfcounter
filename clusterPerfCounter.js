var cluster = require('cluster');

var config = require('./config').config;

var ClusterPerfCounter = function () {
  var self = this;
  this.perfCounter = null;
  this.initMetrics();

  if (cluster.isMaster) {
    this.perfCounter = require('./perfCounter').getInstance();
    cluster.on('online', function (worker) {
      worker.on('message', function (data) {
        if (data.type === 'PUSH_METRICS') {
          self.handleMessage(data.value);
        }
      });
    });
  } else {
    setInterval(function () {
      self.sendToMaster();
    }, config.cluster.connInterval * 1000);
  }
};

ClusterPerfCounter.prototype.initMetrics = function () {
  this.tags = {};
  this.counters = {};
  this.meters = {};
  this.hists = {};
  this.timers = {};
};

ClusterPerfCounter.prototype.handleMessage = function(metrics) {

  for (var name in metrics.counters) {
    this.perfCounter.incCounter(name, metrics.counters[name]);
  }
  for (var name in metrics.meters) {
    this.perfCounter.markMeter(name, metrics.meters[name]);
  }
  for (var name in metrics.hists) {
    for (var i in metrics.hists[name]) {
      this.perfCounter.updateHistogram(name, metrics.hists[name][i]);
    }
  }
  for (var name in metrics.timers) {
    for (var i in metrics.timers[name]) {
      this.perfCounter.updateTimer(name, metrics.timers[name][i]);
    }
  }
  for (var name in metrics.tags) {
    this.perfCounter.addTags(name, metrics.tags[name]);
  }
};

ClusterPerfCounter.prototype.incCounter = function (name, n) {
  if (!this.counters[name]) this.counters[name] = 0;
  this.counters[name] += n;
};

ClusterPerfCounter.prototype.markMeter = function (name, n) {
  if (!this.meters[name]) this.meters[name] = 0;
  this.meters[name] += n;
};

ClusterPerfCounter.prototype.updateHistogram = function (name, n) {
  if (!this.hists[name]) this.hists[name] = [];
  this.hists[name].push(n);
};

ClusterPerfCounter.prototype.updateTimer = function (name, n) {
  if (!this.timers[name]) this.timers[name] = [];
  this.timers[name].push(n);
};

ClusterPerfCounter.prototype.count = function (name, count) {
  this.markMeter(name, count);
};

ClusterPerfCounter.prototype.duration = function (name, duration) {
  this.updateTimer(name, duration);
};

ClusterPerfCounter.prototype.addTags = function (name ,tags) {
  var t = this.tags[name] = this.tags[name] || {};
  for (var k in tags) {
    if (tags.hasOwnProperty(k)) {
      t[k] = tags[k];
    }
  }
};

ClusterPerfCounter.prototype.sendToMaster = function () {
  var data = {
    pid: process.pid,
    type: 'PUSH_METRICS',
    value: {
      counters: this.counters,
      meters: this.meters,
      hists: this.hists,
      timers: this.timers,
      tags: this.tags
    }
  };
  process.send(data);
  this.initMetrics();
};

var getInstance = function () {
  var instance;
  return function () {
    if (!instance) {
      instance = new ClusterPerfCounter();
    }
    return instance;
  }
}();

exports.getInstance = getInstance;
