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

const { FAI_ENV } = process.env;

// 获取模板文件
const getCreateAppFn = ({ templateName, templateVersion, basepath }) => {
  let createApp;

  if (FAI_ENV === 'debug') {
    // 本机开发环境
    createApp = require(`./template/${templateName}.example.js`);
  } else if (basepath) {
    // 独立、本地环境
    createApp = require(path.join(basepath, `dist/${templateName}.src.js`))
  } else {
    // 测试、线上环境
    if (templateVersion) {
      createApp = require(`./template/${templateName}-${templateVersion}.js`);
    } else {
      createApp = require(`./template/${templateName}.js`);
    }
  }

  return createApp;
};

// 获取模块 html
const getModuleHtml = async (args) => {
    // json parse
    const data = JSON.parse(args);

    // get create app function
    const createApp = getCreateAppFn(data);

    // server side render
    const service = new VueSsrService({
      Vue,
      renderer,
      createApp
    });
    const html = await service.invoke(data);
    return html;
};

// 渲染模块
const renderModule = async (body, header) => {
  let rt = Errno.ERROR;

  // recv
  const recvBody = new FaiBuffer(body);
  let keyRef = {};
  // recv args
  const argsRef = {};
  rt = recvBody.getString(keyRef, argsRef);
  if (rt != Errno.OK || keyRef.value != SiteSsrDef.Protocol.Key.ARGS) {
    rt = Errno.ARGS_ERROR;
    throw new Error('args codec error;flow=%d;rt=%d', header.flow, rt);
  }

  // invoke
  const html = await getModuleHtml.apply(null, [ argsRef.value ]);

  // send
  const sendBody = new FaiBuffer();
  rt = sendBody.putString(SiteSsrDef.Protocol.Key.INFO, html);
  if (rt != Errno.OK) {
    throw new Error('html codec error;flow=%d;rt=%d', header.flow, rt);
  }

  return sendBody;
};

module.exports = {
  [SiteSsrDef.Protocol.Cmd.RENDER_MODULE]: renderModule
};