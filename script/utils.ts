import _ from 'lodash';
import http, { RequestOptions } from 'http';
import { URL } from 'url';
import qs from 'qs';
import bent from 'bent';
import iconv from 'iconv-lite';
import vm from 'vm';

export const toProgress = (num: number, precision: number = 2): number => {
  return _.floor(num, precision);
};

export async function jsonp (url: string, callbackName = '') {
  const urlObj = new URL(url);
  console.log('url: ' + urlObj.searchParams);
  const params = qs.parse(urlObj.search, {
    ignoreQueryPrefix: true,
    plainObjects: true
  });
  const funcName = String(params[callbackName] || '');
  const getData = bent('buffer', 200);
  const buf = await getData(url) as Buffer;
  const str = iconv.decode(buf, 'gbk');
  console.log('data', str);
  return getDataByVm(str, funcName);
}


export function getDataByVm(codeStr: string, funcName: string): any {
  const context = {
    returnData: {}
  };
  const script = new vm.Script(`
  function ${funcName}(data) {
    returnData = data;
    return data
  }
  ${codeStr}`);

  script.runInNewContext(context);
  console.log('context', context);
  return context.returnData;
}