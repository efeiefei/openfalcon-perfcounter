/**
 * Created by efei on 15-9-2.
 */

var os = require('os'),
  request = require('request');

var config = require('./config').config,
  buildFalconArray = require('./falconDataBuilder').buildFalconArray;

var startPushTask = function (perfCounter) {
  this.interval = setInterval(function () {
    push(perfCounter);
  }, config.step * 1000);
};

var push = function (perfCounter) {
  var ms = buildFalconArray(perfCounter);
  console.log('Push Metrics Count: ', ms.length);
  var options = {
    method: 'POST',
    json: true,
    body: ms,
    url: config.agentUri
  };
  request(options, function (err, res, body) {
    if (err) console.log('err: ', err);
    else if (res.statusCode !== 200) console.log('Send Perf Counter to Falcon Agent Failed: ', body);
    else console.log('Send Perf Counter to Falcon Agent Succeed');
  });
};

exports.startPushTask = startPushTask;
