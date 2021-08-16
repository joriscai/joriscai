import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import dayjs from 'dayjs';
import { toProgress } from './utils';
import { classifyDaysInMonth, DayStatus } from './workDay';

const tplDirPath = path.join(process.cwd(), 'tpl');

const textStr = fs.readFileSync(path.join(tplDirPath, 'tpl-1.md'), 'utf8');

const compiler = _.template(textStr, {});

async function init() {
  const current = dayjs();
  const startOfYear = current.startOf('year');
  const nextYear = startOfYear.add(1, 'year');
  const startOfMonth = current.startOf('month');
  const totalDayOfMonth = current.daysInMonth();
  const totalDayOfYear = nextYear.diff(startOfYear, 'day');

  const year = current.year();
  const month = current.month() + 1;
  const date = current.date();
  const passedDayOfYear = current.diff(startOfYear, 'day');
  const passedDayOfMonth = current.diff(startOfMonth, 'day');
  const dayProgressOfYear = toProgress(passedDayOfYear / totalDayOfYear) + '%';
  const dayProgressOfMonth = toProgress(passedDayOfMonth / totalDayOfMonth)+ '%';
  // get work data
  const { workDay, todayStatus, passWorkDay } = await classifyDaysInMonth(year, month, date);
  const passedDayOfWork = passWorkDay;
  const totalDayOfWork = workDay;
  const dayProgressOfWork = toProgress(passWorkDay / workDay) + '%';

  const compiled = compiler({
    year,
    month,
    date,
    passedDayOfYear,
    passedDayOfMonth,
    dayProgressOfYear,
    dayProgressOfMonth,
    totalDayOfYear,
    totalDayOfMonth,
    passedDayOfWork,
    totalDayOfWork,
    dayProgressOfWork,
    todayStatus: DayStatus[todayStatus]
  });

  console.log('compiled', compiled);
  // output to file
  fs.outputFileSync(path.join(process.cwd(), './dist/README.md'), compiled);
}

init();



