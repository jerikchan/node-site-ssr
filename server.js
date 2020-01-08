'use strict';

const { RpcServer } = require('@fk/rpc-node').server;
const logger = console;
const siteSsrProc = require('./siteSsrProc');

const serverSignature = 'fai.svr.siteSsrSvr';

// 创建 RPC Server 实例
const server = new RpcServer({
  logger,
  port: process.env.port || 7002
});

// 添加服务
server.addService(serverSignature, siteSsrProc);

// 启动 Server
server.start();
