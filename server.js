'use strict';

const path = require('path');
const { RpcServer } = require('@fk/rpc-node').server;
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';
const siteSsrProc = require('./siteSsrProc');

// 创建 RPC Server 实例
const server = new RpcServer({
  logger,
  port: process.env.port || 7002
});

// 添加服务
server.addService({ interfaceName: 'fai.node.siteSsr', version: '1.0' }, siteSsrProc);

server.on('request', ({ req }) => {
  logger.info('---------------------');
  logger.info('[service] serverSignature=%s;methodName=%s', req.data.serverSignature, req.data.methodName);
  logger.info('[header] flow=%s;aid=%s;wid=%s', req.options.header.flow, req.options.header.aid, req.options.header.wid);
}).on('response', ({ res, req }) => {
  logger.info('[meta] requestSize=%s;responseSize=%s;costTime=%sms', res.meta.reqSize, res.meta.resSize, Date.now() - req.meta.start);
});

// 启动 Server
server.start();
