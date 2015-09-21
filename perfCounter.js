var metrics = require('metrics');
var startPushTask = require('./pushTask').startPushTask;

var PerfCounter = function () {
  this.tags = {};
  this.counters = {};
  this.meters = {};
  this.hists = {};
  this.timers = {};
};

PerfCounter.prototype.addTags = function (name ,tags) {
  var t = this.tags[name] = this.tags[name] || {};
  for (var k in tags) {
    if (tags.hasOwnProperty(k)) {
      t[k] = tags[k];
    }
  }
};

PerfCounter.prototype.getTag = function (name) {
  return this.tags[name] || {};
};

PerfCounter.prototype.getCounter = function (name) {
  return this.counters[name] = this.counters[name] || new metrics.Counter();
};

PerfCounter.prototype.incCounter = function (name, n) {
  this.getCounter(name).inc(n);
};

PerfCounter.prototype.getMeter = function (name) {
  return this.meters[name] = this.meters[name] || new metrics.Meter();
};

PerfCounter.prototype.markMeter = function (name, n) {
  this.getMeter(name).mark(n);
};

PerfCounter.prototype.getHistogram = function (name) {
  return this.hists[name] = this.hists[name] || new metrics.Histogram();
};

PerfCounter.prototype.updateHistogram = function (name, n) {
  this.getHistogram(name).update(n);
};

PerfCounter.prototype.getTimer = function (name) {
  return this.timers[name] = this.timers[name] || new metrics.Timer();
};

PerfCounter.prototype.updateTimer = function (name, n) {
  this.getTimer(name).update(n);
};

PerfCounter.prototype.count = function (name, count) {
  this.markMeter(name, count);
};

PerfCounter.prototype.duration = function (name, duration) {
  this.updateTimer(name, duration);
};

PerfCounter.prototype.printObj = function () {
  var metricObj = {};
  var types = ['counters', 'meters', 'hists', 'timers'];
  for (var i in types) {
    var type = types[i];
    metricObj[type] = {};
    for (var name in this[type]) {
      metricObj[type][name] = this[type][name].printObj();
    }
  }
  return metricObj;
};

var getInstance = function () {
  var instance;
  return function() {
    if (!instance) {
      instance = new PerfCounter();
      startPushTask(instance);
    }
    return instance;
  }
}();

exports.getInstance = getInstance;
