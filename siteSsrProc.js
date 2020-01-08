'use strict';

const path = require('path');
const debug = require('debug')('siteSsr2:siteSsrProc');

// 确保 vue 和 vue-server-renderer 为同一个版本
const Vue = require('vue');
const renderer = require('vue-server-renderer').createRenderer();
// vue 渲染引擎
const VueSsrService = require('@fk/vue-ssr-service');
// 序列化
const FaiBuffer = require('@fk/FaiBuffer');
// 返回码
const Errno = require('@fk/Errno');
// def
const SiteSsrDef = require('./siteSsrDef');

// 业务运行的方法
async function renderModule(body, header) {
  console.time('service invoke');

  // recv
  const recvBody = new FaiBuffer(body);
  let rt = Errno.ERROR;
  let bufKeyRef = {};
  const argRef = {};
  rt = recvBody.getString(bufKeyRef, argRef);
  if (rt != Errno.OK || bufKeyRef.value != SiteSsrDef.Protocol.Key.ARGS) {
    rt = Errno.ARGS_ERROR;
    throw(rt, 'arg=null;flow=%d;', header.flow);
  }

  // json parse
  const data = JSON.parse(argRef.value);

  // get create app function
  const createApp = data.basepath ? require(path.join(data.basepath, 'dist/module.server.src.js')) : require('./module.server.min.js');

  // server side render
  const service = new VueSsrService({
    Vue,
    renderer,
    createApp
  });
  const moduleHtml = await service.invoke(data);

  // send
  const sendBody = new FaiBuffer();
  rt = sendBody.putString(SiteSsrDef.Protocol.Key.MODULE_HTML, moduleHtml);
  if (rt != Errno.OK) {
    throw(rt, 'module html codec error;flow=%d', header.flow);
  }

  console.timeEnd('service invoke');
  return sendBody;
}

module.exports = {
  [SiteSsrDef.Protocol.Cmd.SITE_RENDER]: renderModule
};