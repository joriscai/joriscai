import { URL } from 'url';
import { jsonp } from './utils';
import { forEach } from 'lodash';
import dayjs from 'dayjs';
import { outputJsonSync, readJsonSync } from 'fs-extra';
import path from 'path';

export enum DayStatus {
  holiday = 1,
  work,
}

// cache or request
export const classifyDaysInMonth = async (queryYear: number, queryMonth: number, queryDate: number)=> {
  // saveFile to .cache dir, name is year + month.json
  // TODO: Actions cache key is date +"%Y-%m"
  const dayIns = dayjs(`${queryYear}/${queryMonth}/${queryDate}`);
  const cacheDir = path.join(process.cwd(), '.cache');
  const cacheFilePath = path.join(cacheDir, `${dayIns.format('YYYY-MM')}.json`);
  const cacheData = readJsonSync(cacheFilePath, {
    throws: false
  });
  const { updateTime = 0, data = [] } = cacheData || {};
  const isMatch = dayIns.isSame(dayjs(updateTime || 0), 'month');
  console.log('cacheData ===', cacheData);
  let almanac = data;
  if (!isMatch) {
    // get day and save to cache
    const respAlmanac = await getAlmanac(queryYear, queryMonth);
    outputJsonSync(cacheFilePath, {
      updateTime: +dayIns,
      data: respAlmanac,
    });
    almanac = respAlmanac;
  }

  // classify
  return classifyDay(almanac, +dayIns);
};

export const getAlmanac = async (queryYear: number, queryMonth: number) => {
  const urlObj = new URL('https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?co=&resource_id=39043&t=1628813955963&ie=utf8&oe=gbk&format=json&tn=wisetpl&cb=jQuery110207609665053668757_1628813395279&_=1628813395308');
  urlObj.searchParams.set('query', `${queryYear}年${queryMonth}月`);
  console.log('url: ' + urlObj.searchParams);
  const resp = await jsonp(urlObj.toString(), 'cb');
  const { almanac } = resp.data[0] || {};
  console.log('almanac', almanac.length);

  return almanac || [];
};

export const classifyDay = (almanac: [], date: string | Date | number) => {
  const today = dayjs(date);
  const queryYear = today.year();
  const queryMonth = today.month() + 1;
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