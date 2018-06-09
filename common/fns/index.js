/*
 * @Author: Kevin Bolton
 * @Date: 2018-01-22 15:59:29
 * @Last Modified by: Kevin Bolton
 * @Last Modified time: 2018-01-25 11:32:07
 */
const consts = require('../consts');
const crypto = require('crypto');
const moment = require('moment');

/**
 * 公共方法设置
 * fnApi
 *
 */
const fnApi = {
  // 获取并处理响应的json数据
  // status 值等于 1:正常 0:获取数据出错
  getResJson: (status = 0, message = consts.MSGETDATAERROR, extData = {}) => ({
    status,
    message,
    extData,
  }),
  // 设置密码HAMC值
  setHmac: (str) => {
    const hmac = crypto.createHmac('sha256', consts.SECRETKEY);
    hmac.update(consts.SECRETKEY);
    hmac.update(str);
    return hmac.digest('hex');
  },
  // 获取收支明细的类型（收入/支出）
  getSortType(type, codes = []) {
    let result = '';

    // console.log(codes);

    // for (let code of codes) {
    //   if (type === code.sortId) {
    //     sortType = code.sortType;
    //     break;
    //   }
    // }
    for (let i = 0; i < codes.length; i += 1) {
      if (type === codes[i].sortId) {
        result = codes[i].sortType;
        break;
      }
    }

    // console.log(parseInt(sortType, 10));
    return parseInt(result, 10);
  },
  // 处理日期时间 -> 格式化日期 如: 2017-07-26
  dateTodateline(time) {
    // 返回处理后的值
    // const datetime = new Date(parseInt(time, 10));
    // const line = '-';
    // const year = datetime.getFullYear();
    // const month = datetime.getMonth() + 1;
    // const day = datetime.getDate();
    // let date = year + line;

    // date += (month < 10 ? `0${month}` : month) + line;
    // date += day < 10 ? `0${day}` : day;

    const date = moment(parseInt(time, 10)).format('YYYY-MM-DD');

    return date;
  },
  // 处理并计算收入和支出的金额
  getAmountData(item, codes) {
    let income = 0;
    let outlay = 0;

    if (fnApi.getSortType(item.sortId, codes) === 1) {
      // 获取支出金额
      outlay = parseFloat(item.accountAmount);
    } else {
      // 获取收入金额
      income = parseFloat(item.accountAmount);
    }

    return { income, outlay };
  },
};

/**
 * 输出公共方法
 * export
 *
 */
module.exports = fnApi;
