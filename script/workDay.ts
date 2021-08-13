
import { URL } from 'url';
import { jsonp } from './utils';
import qs from 'qs';
import { forEach, groupBy, keyBy } from 'lodash';
import dayjs from 'dayjs';

export enum DayStatus {
  holiday = '1',
  work = '2',
}

export const classifyWorkDay = async (queryYear: number, queryMonth: number) => {
  const urlObj = new URL('https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=2021%E5%B9%B49%E6%9C%88&co=&resource_id=39043&t=1628813955963&ie=utf8&oe=gbk&format=json&tn=wisetpl&cb=jQuery110207609665053668757_1628813395279&_=1628813395308');
  console.log('url: ' + urlObj.searchParams);
  const resp = await jsonp(urlObj.toString(), 'cb');
  const { almanac } = resp.data[0] || {};
  const today = dayjs();
  let workDay = 0;
  let holiday = 0;
  let passWorkDay = 0;
  forEach(almanac, (item) => {
    const { year, month, day, status } = item;
    if (Number(year) === queryYear && Number(month) === queryMonth) {
      const curDate = dayjs(`${year}/${month}/${day}`);
      const isBefore = curDate.isBefore(today, 'date');
      const weekDay = curDate.day();
      if (status === DayStatus.holiday) {
        workDay > 0 && workDay--;
        holiday++;
      } else if (status === DayStatus.work) {
        workDay++;
        isBefore && passWorkDay++;
      } else if (weekDay > 0 && weekDay < 6) {
        workDay++;
        isBefore && passWorkDay++;
      } else {
        holiday++;
      }
    }
  });

  return {
    workDay,
    holiday,
    passWorkDay
  };
};