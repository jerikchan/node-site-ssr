'use strict';

const { RpcServer } = require('@jsnetkit/rpc').server;
const { logger } = require('@jsnetkit/logger');
const siteSsrProc = require('./siteSsrProc');

exports.start = () => {
  // 创建 RPC Server 实例
  const server = new RpcServer({
    logger,
    port: process.env.port || 7002
  });

  // 添加服务
  server.addService({ interfaceName: 'fai.node.siteSsr', version: '1.0' }, siteSsrProc);

  // 数据记录
  server.on('response', ({ res, req }) => {
    // logger.info('[NodeSiteSsrInfo] serviceInvokeRt=%sms;responseEncodeRt=%sms;requestSize=%s;responseSize=%s;', 
    //   res.meta.rt, 
    //   res.meta.responseEncodeRT, 
    //   res.meta.reqSize,
    //   res.meta.resSize,
    // );
    if (res.meta.resultCode !== '00') {
      logger.error('[NodeSiteSsrResponse] aid=%s;wid=%s;flow=%s;serviceName=%s;cmd=%s;resultCode=%s;', 
        req.options.header.aid,
        req.options.header.wid,
        req.options.header.flow,
        res.meta.serviceName, 
        res.meta.method,
        res.meta.resultCode,
      );
    }
  }).on('error', (e) => {
    logger.error('[NodeSiteSsrError]', e.name, e.message);
    logger.warn(e.stack);
  });

  // 启动 Server
  server.start();
};