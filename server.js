'use strict';

const { RpcServer } = require('@fk/rpc-node').server;
const logger = console;
const siteSsrProc = require('./siteSsrProc');

// 创建 RPC Server 实例
const server = new RpcServer({
  logger,
  port: process.env.port || 7002
});

// 添加服务
server.addService({ interfaceName: 'fai.node.siteSsr', version: '1.0' }, siteSsrProc);

// 启动 Server
server.start();
