var OP = require('openfalcon-perfcounter');

OP.setOption({
  step: 300
});
var PerfCounter = OP.getInstance();
var PerfCounter2 = OP.getInstance();

var randNum = function (max) {
  return Math.random() * max | 0;
};

var randomCount = function (perfCounter) {
  perfCounter.incCounter('test.c1', randNum(100));
  perfCounter.markMeter('test.m1', randNum(100));
  perfCounter.updateHistogram('test.h1', randNum(100));
  perfCounter.updateTimer('test.t1', randNum(100));
  perfCounter.count('test.cc1', randNum(10));
  perfCounter.duration('test.dd1', randNum(50));
};

setInterval(function () {
  randomCount(PerfCounter);
}, 3000);

setInterval(function () {
  randomCount(PerfCounter2);
}, 2000);
