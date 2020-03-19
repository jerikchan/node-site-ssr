'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const pump = require('pump');
const md5 = require('md5');

const fetchDNSFile = (fileDNSPath, options = {}) => {
  const { 
    cache = false, 
    logger = console 
  } = options;
  const filename = md5(fileDNSPath);
  const fileLocalPath = path.join(__dirname, '../fixtures/', `${filename}.js`);

  return new Promise((resolve, reject) => {
    // use local cache file
    if (cache && fs.existsSync(fileLocalPath)) {
      logger.log('using local cache');
      resolve(fileLocalPath);
    } else {
      // avoid dns cache
      const requestPath = cache ? fileDNSPath : `${fileDNSPath}${fileDNSPath.indexOf('?') > -1 ? '&' : '?'}r=${Math.floor(Math.random() * 1000)}`;

      // get remote file
      logger.log(`fetching url is: ${requestPath}`);
      const req = http.request(requestPath, (res) => {
        if (res.statusCode !== 200) {
          reject(`download error, code: ${res.statusCode}`);
        }
  
        const ws = fs.createWriteStream(fileLocalPath);
        pump(res, ws, (err) => {
          if (err) {
            reject(err);
          }
          logger.log('file donwload finished');
          resolve(fileLocalPath);
        });
      });
      req.on('error', reject);
      req.end();
    }
  })
  .catch(logger.error)
  .then((fileLocalPath = '') => {
    if (fileLocalPath) {
      logger.log(`get file success, file path is: ${fileLocalPath}`);
    }
    return fileLocalPath;
  });
};

// // test
// (async () => {
//   const filePath = await fetchDNSFile('http://1.ss.aaadns.com/js/dist/module.server.src.js', { cache: false });
// })();

module.exports = {
  fetchDNSFile
};