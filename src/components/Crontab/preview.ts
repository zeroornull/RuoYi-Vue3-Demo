function compareNumber(left: number, right: number): number {
  return left - right;
}

function getOrderArr(min: number, max: number): number[] {
  const values: number[] = [];
  for (let value = min; value <= max; value += 1) {
    values.push(value);
  }
  return values;
}

function getAssignArr(rule: string): number[] {
  return rule
    .split(",")
    .map((item) => Number(item))
    .sort(compareNumber);
}

function getAverageArr(rule: string, limit: number): number[] {
  const [rawMin, rawStep] = rule.split("/");
  let min = Number(rawMin);
  const step = Number(rawStep);
  const values: number[] = [];
  while (min <= limit) {
    values.push(min);
    min += step;
  }
  return values;
}

function getCycleArr(rule: string, limit: number, fromZero: boolean): number[] {
  const [rawMin, rawMax] = rule.split("-");
  const min = Number(rawMin);
  let max = Number(rawMax);
  if (min > max) {
    max += limit;
  }
  const values: number[] = [];
  for (let value = min; value <= max; value += 1) {
    let add = 0;
    if (!fromZero && value % limit === 0) {
      add = limit;
    }
    values.push(Math.round((value % limit) + add));
  }
  return values.sort(compareNumber);
}

function pad(value: number | string): string {
  const numeric = typeof value === "number" ? value : Number(value);
  return numeric < 10 ? `0${numeric}` : String(numeric);
}

function formatDateTime(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

function checkDate(value: string): boolean {
  const time = new Date(value);
  return value === formatDateTime(time);
}

function quartzWeek(date: Date): number {
  return date.getDay() + 1;
}

function getIndex(values: readonly number[], current: number): number {
  const first = values[0];
  const last = values[values.length - 1];
  if (first === undefined || last === undefined || current <= first || current > last) {
    return 0;
  }
  for (let index = 0; index < values.length - 1; index += 1) {
    const left = values[index];
    const right = values[index + 1];
    if (left !== undefined && right !== undefined && current > left && current <= right) {
      return index + 1;
    }
  }
  return 0;
}

function fieldValues(rule: string | undefined, min: number, max: number, fromZero: boolean): number[] {
  const fallback = getOrderArr(min, max);
  if (rule === undefined || rule === "*" || rule === "?") {
    return fallback;
  }
  if (rule.includes("-")) {
    return getCycleArr(rule, fromZero ? max + 1 : max, fromZero);
  }
  if (rule.includes("/")) {
    return getAverageArr(rule, max);
  }
  return getAssignArr(rule);
}

type DayRule =
  | { kind: "none" }
  | { kind: "lastDay" }
  | { kind: "workDay"; day: number }
  | { kind: "weekDay"; days: number[] }
  | { kind: "assWeek"; week: number; weekday: number }
  | { kind: "lastWeek"; weekday: number };

function parseDayRule(
  dayRule: string,
  weekRule: string | undefined,
): {
  days: number[];
  rule: DayRule;
} {
  let days = getOrderArr(1, 31);
  let rule: DayRule = { kind: "none" };
  if (dayRule.includes("-")) {
    days = getCycleArr(dayRule, 31, false);
  } else if (dayRule.includes("/")) {
    days = getAverageArr(dayRule, 31);
  } else if (dayRule.includes("W")) {
    const day = Number(dayRule.match(/[0-9]{1,2}/g)?.[0]);
    rule = { kind: "workDay", day };
    days = [day];
  } else if (dayRule.includes("L")) {
    rule = { kind: "lastDay" };
    days = [31];
  } else if (dayRule !== "*" && dayRule !== "?") {
    days = getAssignArr(dayRule);
  }

  if (rule.kind === "none" && weekRule && weekRule !== "*" && weekRule !== "?") {
    if (weekRule.includes("-")) {
      rule = { kind: "weekDay", days: getCycleArr(weekRule, 7, false) };
    } else if (weekRule.includes("#")) {
      const match = weekRule.match(/[0-9]{1}/g) ?? [];
      const weekday = Number(match[0]);
      const week = Number(match[1]);
      rule = {
        kind: "assWeek",
        week,
        weekday: weekday === 7 ? 0 : weekday,
      };
      days = [1];
    } else if (weekRule.includes("L")) {
      const weekday = Number(weekRule.match(/[0-9]{1,2}/g)?.[0]);
      rule = { kind: "lastWeek", weekday: weekday === 7 ? 0 : weekday };
      days = [31];
    } else {
      rule = { kind: "weekDay", days: getAssignArr(weekRule) };
    }
  }
  return { days, rule };
}

function applyDayRule(year: number, month: string, day: number, rule: DayRule): number | null {
  let resolved = day;
  let formatted = pad(resolved);
  const stamp = () => `${year}-${month}-${formatted} 00:00:00`;
  if (rule.kind === "lastDay" || rule.kind === "workDay" || rule.kind === "lastWeek") {
    if (!checkDate(stamp())) {
      while (resolved > 0 && !checkDate(stamp())) {
        resolved -= 1;
        formatted = pad(resolved);
      }
    }
  } else if (!checkDate(stamp()) && rule.kind !== "none") {
    return null;
  } else if (!checkDate(stamp()) && rule.kind === "none") {
    return null;
  }

  if (rule.kind === "workDay") {
    const week = quartzWeek(new Date(stamp()));
    if (week === 1) {
      resolved += 1;
      formatted = pad(resolved);
      if (!checkDate(stamp())) {
        resolved -= 3;
      }
    } else if (week === 7) {
      resolved = rule.day !== 1 ? resolved - 1 : resolved + 2;
    }
  } else if (rule.kind === "weekDay") {
    const week = quartzWeek(new Date(`${year}-${month}-${resolved} 00:00:00`));
    if (!rule.days.includes(week)) {
      return null;
    }
  } else if (rule.kind === "assWeek") {
    const week = quartzWeek(new Date(`${year}-${month}-${resolved} 00:00:00`));
    resolved =
      rule.weekday >= week ? (rule.week - 1) * 7 + rule.weekday - week + 1 : rule.week * 7 + rule.weekday - week + 1;
  } else if (rule.kind === "lastWeek") {
    const week = quartzWeek(new Date(stamp()));
    if (rule.weekday < week) {
      resolved -= week - rule.weekday;
    } else if (rule.weekday > week) {
      resolved -= 7 - (rule.weekday - week);
    }
  }
  return resolved;
}

export function previewCronRuns(expression: string, now = new Date(), limit = 5): string[] {
  const rules = expression.split(" ");
  const seconds = fieldValues(rules[0], 0, 59, true);
  const minutes = fieldValues(rules[1], 0, 59, true);
  const hours = fieldValues(rules[2], 0, 23, true);
  const parsedDay = parseDayRule(rules[3] ?? "*", rules[5]);
  const months = fieldValues(rules[4], 1, 12, false);
  const startYear = now.getFullYear();
  let years = getOrderArr(startYear, startYear + 100);
  const yearRule = rules[6];
  if (yearRule && yearRule !== "*") {
    if (yearRule.includes("-")) {
      years = getCycleArr(yearRule, startYear + 100, false);
    } else if (yearRule.includes("/")) {
      years = getAverageArr(yearRule, startYear + 100);
    } else {
      years = getAssignArr(yearRule);
    }
  }

  const result: string[] = [];
  let secondIndex = getIndex(seconds, now.getSeconds());
  let minuteIndex = getIndex(minutes, now.getMinutes());
  let hourIndex = getIndex(hours, now.getHours());
  let dayIndex = getIndex(parsedDay.days, now.getDate());
  let monthIndex = getIndex(months, now.getMonth() + 1);
  const yearIndex = getIndex(years, now.getFullYear());

  const resetSecond = () => {
    secondIndex = 0;
  };
  const resetMinute = () => {
    minuteIndex = 0;
    resetSecond();
  };
  const resetHour = () => {
    hourIndex = 0;
    resetMinute();
  };
  const resetDay = () => {
    dayIndex = 0;
    resetHour();
  };
  const resetMonth = () => {
    monthIndex = 0;
    resetDay();
  };

  if (now.getFullYear() !== years[yearIndex]) resetMonth();
  if (now.getMonth() + 1 !== months[monthIndex]) resetDay();
  if (now.getDate() !== parsedDay.days[dayIndex]) resetHour();
  if (now.getHours() !== hours[hourIndex]) resetMinute();
  if (now.getMinutes() !== minutes[minuteIndex]) resetSecond();

  yearLoop: for (let yi = yearIndex; yi < years.length; yi += 1) {
    const year = years[yi];
    if (year === undefined) continue;
    const lastMonth = months[months.length - 1];
    if (lastMonth !== undefined && now.getMonth() + 1 > lastMonth) {
      resetMonth();
      continue;
    }
    for (let mi = monthIndex; mi < months.length; mi += 1) {
      const monthValue = months[mi];
      if (monthValue === undefined) continue;
      const month = pad(monthValue);
      const lastDay = parsedDay.days[parsedDay.days.length - 1];
      if (lastDay !== undefined && now.getDate() > lastDay) {
        resetDay();
        if (mi === months.length - 1) {
          resetMonth();
          continue yearLoop;
        }
        continue;
      }
      for (let di = dayIndex; di < parsedDay.days.length; di += 1) {
        const rawDay = parsedDay.days[di];
        if (rawDay === undefined) continue;
        const lastHour = hours[hours.length - 1];
        if (lastHour !== undefined && now.getHours() > lastHour) {
          resetHour();
          if (di === parsedDay.days.length - 1) {
            resetDay();
            if (mi === months.length - 1) {
              resetMonth();
              continue yearLoop;
            }
            continue;
          }
          continue;
        }
        if (
          !checkDate(`${year}-${month}-${pad(rawDay)} 00:00:00`) &&
          parsedDay.rule.kind !== "workDay" &&
          parsedDay.rule.kind !== "lastWeek" &&
          parsedDay.rule.kind !== "lastDay"
        ) {
          resetDay();
          continue;
        }
        const resolvedDay = applyDayRule(year, month, rawDay, parsedDay.rule);
        if (resolvedDay === null || resolvedDay <= 0) {
          continue;
        }
        const day = pad(resolvedDay);
        if (month === "00" || day === "00") {
          continue;
        }
        for (let hi = hourIndex; hi < hours.length; hi += 1) {
          const hourValue = hours[hi];
          if (hourValue === undefined) continue;
          const hour = pad(hourValue);
          const lastMinute = minutes[minutes.length - 1];
          if (lastMinute !== undefined && now.getMinutes() > lastMinute) {
            resetMinute();
            continue;
          }
          for (let mini = minuteIndex; mini < minutes.length; mini += 1) {
            const minuteValue = minutes[mini];
            if (minuteValue === undefined) continue;
            const minute = pad(minuteValue);
            const lastSecond = seconds[seconds.length - 1];
            if (lastSecond !== undefined && now.getSeconds() > lastSecond) {
              resetSecond();
              continue;
            }
            for (let si = secondIndex; si < seconds.length; si += 1) {
              const secondValue = seconds[si];
              if (secondValue === undefined) continue;
              result.push(`${year}-${month}-${day} ${hour}:${minute}:${pad(secondValue)}`);
              if (result.length === limit) {
                return result;
              }
            }
            resetSecond();
          }
          resetMinute();
        }
        resetHour();
      }
      resetDay();
    }
    resetMonth();
  }
  return result;
}
