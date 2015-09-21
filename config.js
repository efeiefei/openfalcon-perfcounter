var os = require('os');

var config = {
  agentUri: 'http://127.0.0.1:1988/v1/push',
  step: 60,
  endpoint: os.hostname() || 'localhost',
  cluster: {
    connInterval: 1
  }
};

var setOption = function(conf) {
  for (var k in conf) {
    if (conf.hasOwnProperty(k)) {
      config[k] = conf[k];
    }
  }
};

exports.config = config;
exports.setOption = setOption;
