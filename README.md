# 说明

[Open-Falcon](http://open-falcon.com/) 是小米运维部开源的一款互联网企业级监控系统解决方案，分为Agent、Transfe、Graph、Sender、Judge等模块。Agent会定时搜集机器的相关信息并上报；同时可以**接收用户自定义数据**。

[Metrics](http://dropwizard.github.io/metrics/2.2.0/getting-started/) 提供了强大的统计功能，分为guage、counter、meter、histogram、timer 5种基础数据结构。其Node实现为[Node Metrics](https://github.com/mikejihbe/metrics)。

[本模块](https://github.com/efeiefei/openfalcon-perfcounter) 基于Node实现，主要功能为：
1. 提供简易调用接口
2. 统计分析相关数据
3. 转换数据为Agent可接受格式
4. 定时发送数据到Agen

# 使用方式

## 安装
```sh
npm install openfalcon-perfcounter
```
## 调用
```javascript
var PerfCounter = require('openfalcon-perfcounter').getInstance();
PerfCounter.count(eventName, count);            // 统计次数，可形成频率
PerfCounter.duration(eventName, duration);      // 统计时间，可形成分布
```
就是这么简单，相关数据在搭建好的Falcon平台上就可以看到了。

# API

1.引入 ```var OP = require('openfalcon-perfcounter');```

2.设置 ```OP.setOption(option);``` 
初始设置：
```javascript
{
  agentUri: 'http://127.0.0.1:1988/v1/push',
  step: 60,         // 每隔60秒向agent发送一次数据
  endpoint: os.hostname() || 'localhost',
  cluster: {
    connInterval: 1
  }
};
```
若不调用，则使用初始设置。

3.获取实例
```javascript
var PerfCounter = OP.getInstance();             // 用于普通模式
var PerfCounter = OP.getClusterInstance();      // 用于cluster模式
```
若使用cluster模式，需调用getClusterInstance()。因为多个进程就同一event向Agent发送数据，Agent不会自动加和；若调用getClusterInstance()，PerfCounter会在每个worker进程向master进程发送数据，由master进程加和后发送给Agent。

4.设置Tag ```PerfCounter.addTags(eventName, {k1: v1, k2: v2})```

Tag 会发送到Agent模块。

5.计数
```javascript
PerfCounter.count(eventName, count);            // 统计次数，可形成频率
PerfCounter.duration(eventName, duration);      // 统计时间，可形成分布
```

perfCounter会自动分析出count()的 **CPS-1-min、CPS-5-min、CPS-15-min**，即1分钟、5分钟、15分钟内的调用频率（次/秒）

PerfCounter会自动分析出duration()的 **75-percentile、95-percentile、99-percentile、999-percentile**，即75%、95%、99%、99.9% 采样的最大时间。

6.详细控制

同时提供 incCounter、markMeter、updateHistogram、updateTimer 四种方法进行更精确的控制。其实count()与duration()就是利用meter及timer实现的。具体查看代码吧。
