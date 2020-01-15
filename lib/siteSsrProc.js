'use strict';

const { FaiBuffer } = require('@jsnetkit/buffer');
const { Errno } = require('@jsnetkit/errno');
const SiteSsrDef = require('./siteSsrDef');
const Comm = require('./comm');
const { logger } = require('@jsnetkit/logger');

module.exports = {
  // 渲染模块
  [SiteSsrDef.Protocol.Cmd.RENDER_MODULE]: async function renderModule(body, header) {
    let rt = Errno.ERROR;
    // recv
    const recvBody = new FaiBuffer(body);
    let keyRef = {};
    // recv args
    const argsRef = {};
    rt = recvBody.getString(keyRef, argsRef);
    if (rt != Errno.OK || keyRef.value != SiteSsrDef.Protocol.Key.ARGS) {
      rt = Errno.ARGS_ERROR;
      // 接收数据编码异常
      throw new Error('args decode error');
    }
  
    // invoke
    let info;
    try {
      info = Comm.getSsrHtml(argsRef.value);
    } catch (err) {
      // json数据反序列化错误、模板文件获取异常、模板渲染失败，把信息返回到客服端
      err.name = SiteSsrDef.Config.ERROR_SIGNATURE;
      // 输出到 node 日志组件
      logger.error(err);
      // 返回给 cli 端
      info = err;
    }

    // 压测工具以回车符分割
    info += '\n';

    // send
    const sendBody = new FaiBuffer();
    rt = sendBody.putString(SiteSsrDef.Protocol.Key.INFO, info);
    if (rt != Errno.OK) {
      // 接收数据编码异常
      throw new Error('html encode error');
    }
    return sendBody;
  }
};