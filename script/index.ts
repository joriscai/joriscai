import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import dayjs from 'dayjs';
import { toProgress } from './utils';
import { classifyWorkDay } from './workDay';

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
  const passedDayOfYear = current.diff(startOfYear, 'day');
  const passedDayOfMonth = current.diff(startOfMonth, 'day');
  const dayProgressOfYear = toProgress(passedDayOfYear / totalDayOfYear) + '%';
  const dayProgressOfMonth = toProgress(passedDayOfMonth / totalDayOfMonth)+ '%';
  // TODO: work data request
  // TODO: compute the data
  const { workDay, holiday, passWorkDay } = await classifyWorkDay(2021, 9);
  const passedDayOfWork = passWorkDay;
  const totalDayOfWork = workDay;

  const compiled = compiler({
    year,
    month,
    passedDayOfYear,
    passedDayOfMonth,
    dayProgressOfYear,
    dayProgressOfMonth,
    totalDayOfYear,
    totalDayOfMonth,
    passedDayOfWork,
    totalDayOfWork
  });

  console.log('compiled', compiled);

}

init();



