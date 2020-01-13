'use strict';

const path = require('path');
const { RpcServer } = require('@fk/rpc-node').server;
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = process.env.NODE_ENV === 'production' ? 'error' : 'info';
const siteSsrProc = require('./siteSsrProc');

// 创建 RPC Server 实例
const server = new RpcServer({
  logger,
  port: process.env.port || 7002
});

// 添加服务
server.addService({ interfaceName: 'fai.node.siteSsr', version: '1.0' }, siteSsrProc);

// 数据记录
server.on('response', ({ res, req }) => {
  logger.info('aid=%s;wid=%s;flow=%s;serviceName=%s;cmd=%s;serviceInvokeRt=%sms;responseEncodeRt=%sms;requestSize=%s;responseSize=%s;resultCode=%s;', 
    req.options.header.aid,
    req.options.header.wid,
    req.options.header.flow,
    res.meta.serviceName, 
    res.meta.method,
    res.meta.rt, 
    res.meta.responseEncodeRT, 
    res.meta.reqSize,
    res.meta.resSize,
    res.meta.resultCode,
  );
});

// 启动 Server
server.start();
