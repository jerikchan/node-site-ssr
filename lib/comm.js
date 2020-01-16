'use strict';

const path = require('path');
const { createRenderer } = require('@jsnetkit/vue-renderer');
const { FAI_ENV } = process.env;
const Vue = require('vue');
const renderer = require('vue-server-renderer').createRenderer();
const ROOT_PATH = path.join(__dirname, '..');

// 获取模板文件
const getServerBundle = ({ templateName, templateVersion, basepath }) => {
  let serverBundle;

  if (FAI_ENV === 'debug') {
    // 本机开发环境
    serverBundle = path.join(ROOT_PATH, `template/${templateName}.example.js`);
  } else if (basepath) {
    // 独立、本地环境
    serverBundle = path.join(basepath, `dist/${templateName}.src.js`);
  } else {
    // 测试、线上环境
    if (templateVersion) {
      serverBundle = path.join(ROOT_PATH, `template/${templateName}-${templateVersion}.js`);
    } else {
      serverBundle = path.join(ROOT_PATH, `template/${templateName}.js`);
    }
  }

  return serverBundle;
};

// 获取模块 html
exports.getSsrHtml = (args) => {
  // json parse
  const data = JSON.parse(args);

  // get server bundle
  const bundle = getServerBundle(data);

  // render
  const html = createRenderer({
    version: '2.3.0',
    bundle,
    Vue,
    renderer
  }).renderToString(data);
  
  return html;
};

// 记录信息
exports.saveMessage = ({ logger, req, res }) => {
  // 请求耗时
  const rt = res.meta.end - req.meta.start;
  // 结果码
  const resultCode = res.meta.resultCode;
  // 记录信息
  const message = `[NodeSiteSsr] response - rt=${res.meta.end - req.meta.start}ms;reqSize=${res.meta.reqSize};resSize=${res.meta.resSize};aid=${req.options.header.aid};wid=${req.options.header.wid};flow=${req.options.header.flow};serviceName=${res.meta.serviceName};cmd=${res.meta.method};resultCode=${resultCode};`;

  {
    (resultCode !== '00' || rt > 3000 ? logger.error : rt > 100 ? logger.warn : logger.info)(message);
  }
};