import { URL } from 'url';
import { jsonp } from './utils';
import { forEach } from 'lodash';
import dayjs from 'dayjs';

export enum DayStatus {
  holiday = 1,
  work,
}

export const classifyWorkDay = async (queryYear: number, queryMonth: number) => {
  const urlObj = new URL('https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=2021%E5%B9%B49%E6%9C%88&co=&resource_id=39043&t=1628813955963&ie=utf8&oe=gbk&format=json&tn=wisetpl&cb=jQuery110207609665053668757_1628813395279&_=1628813395308');
  urlObj.searchParams.set('query', `${queryYear}年${queryMonth}月`);
  console.log('url: ' + urlObj.searchParams);
  const resp = await jsonp(urlObj.toString(), 'cb');
  const { almanac } = resp.data[0] || {};
  console.log('almanac', almanac.length);

  const today = dayjs();
  let workDay = 0;
  let holiday = 0;
  let passWorkDay = 0;
  let todayStatus = DayStatus.holiday;
  forEach(almanac, (item) => {
    const { year, month, day, status } = item;
    if (Number(year) === queryYear && Number(month) === queryMonth) {
      const curDate = dayjs(`${year}/${month}/${day}`);
      const isBefore = curDate.isBefore(today, 'date');
      const isSame = curDate.isSame(today, 'date');
      const weekDay = curDate.day();
      const isNormalWorkDay = weekDay > 0 && weekDay < 6;
      const isNormalHoliday = !isNormalWorkDay;
      const isSpecialWorkDay = Number(status) === DayStatus.work;
      const isSpecialHoliday = Number(status) === DayStatus.holiday;
      if ((isNormalWorkDay && !isSpecialHoliday) || isSpecialWorkDay) {
        workDay++;
        isBefore && passWorkDay++;
        isSame && (todayStatus = DayStatus.work);
      } else if ((isNormalHoliday && !isSpecialWorkDay) || isSpecialHoliday) {
        holiday++;
        isSame && (todayStatus = DayStatus.holiday);
      }

    }
  });

  return {
    workDay,
    holiday,
    passWorkDay,
    todayStatus,
  };
};