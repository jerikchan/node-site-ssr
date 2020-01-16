'use strict';

const { RpcServer } = require('@jsnetkit/rpc').server;
const { logger } = require('@jsnetkit/logger');
const siteSsrProc = require('./siteSsrProc');
const Comm = require('./comm');

exports.start = () => {
  // 创建 RPC Server 实例
  const server = new RpcServer({
    logger,
    port: process.env.port || 7002
  });

  // 添加服务
  server.addService({ interfaceName: 'fai.node.siteSsr', version: '1.0' }, siteSsrProc);

  // 数据记录
  server.on('response', ({ res, req }) => { Comm.saveMessage({ logger, req, res }); });

  // 启动 Server
  server.start();
};