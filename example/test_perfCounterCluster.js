var cluster = require('cluster');

var PerfCounter = require('openfalcon-perfcounter').getClusterInstance();

if (cluster.isMaster) {
  cluster.fork();
  cluster.fork();
}
else {
  setInterval(function () {
    randomCount(PerfCounter);
  }, 30);
}

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

