var os = require('os'),
  request = require('request');

var config = require('./config').config;

var buildFalconTag = function (tags) {
  var ts = Object.keys(tags).map(function (name) {
    return name + '=' + tags[name];
  });
  return ts.join(',');
};

var buildFalconObj = function (type, k, v, tags, ts) {
  var obj = {};
  obj.endpoint = config.endpoint;
  obj.metric = k;
  obj.timestamp = ts || Math.floor(Date.now() / 1000);
  obj.step = config.step;
  obj.value = v;
  obj.counterType = type;
  obj.tags = buildFalconTag(tags);
  return obj;
};

var buildCounter = function (name, counter, tags) {
  var m1 = buildFalconObj('COUNTER', name, counter.count, tags);
  return [m1];
};

var buildMeter = function (name, meter, tags) {
  var m1 = buildFalconObj('COUNTER', name, meter.count, tags);
  var m2 = buildFalconObj('GAUGE', name + '.' + 'CPS-1-min', meter.oneMinuteRate(), tags);
  var m3 = buildFalconObj('GAUGE', name + '.' + 'CPS-5-min', meter.fiveMinuteRate(), tags);
  var m4 = buildFalconObj('GAUGE', name + '.' + 'CPS-15-min', meter.fifteenMinuteRate(), tags);
  return  [m1, m2, m3, m4];
};

var buildHistogram = function (name, hist, tags) {
  var percentiles = hist.percentiles();
  var m1 = buildFalconObj('GAUGE', name + '.' + '75-percentile', percentiles[0.75], tags);
  var m2 = buildFalconObj('GAUGE', name + '.' + '95-percentile', percentiles[0.95], tags);
  var m3 = buildFalconObj('GAUGE', name + '.' + '99-percentile', percentiles[0.99], tags);
  var m4 = buildFalconObj('GAUGE', name + '.' + '999-percentile', percentiles[0.999], tags);
  hist.clear();
  return [m1, m2, m3, m4];
};

var buildTimer = function (name, timer, tags) {
  var ms1 = buildMeter(name, timer.meter, tags);
  var ms2 = buildHistogram(name, timer.histogram, tags);
  return ms1.concat(ms2);
};

var buildFalconArray = function (PerfCounter) {
  var ms = [];
  for (var name in PerfCounter.counters) {
    ms = ms.concat(buildCounter(name, PerfCounter.getCounter(name), PerfCounter.getTag(name)));
  }
  for (var name in PerfCounter.meters) {
    ms = ms.concat(buildMeter(name, PerfCounter.getMeter(name), PerfCounter.getTag(name)));
  }
  for (var name in PerfCounter.hists) {
    ms = ms.concat(buildHistogram(name, PerfCounter.getHistogram(name), PerfCounter.getTag(name)));
  }
  for (var name in PerfCounter.timers) {
    ms = ms.concat(buildTimer(name, PerfCounter.getTimer(name), PerfCounter.getTag(name)));
  }
  return ms;
};

exports.buildFalconArray = buildFalconArray;
