import { Moment } from 'moment';

export interface Time {
  hours: number;
  minutes: number;
}

export interface Test {
  input: any[];
  output: any;
}

export const toTime = (seconds: number): Time => {
  const hour = Math.floor(seconds / (60 * 60));
  const minute = Math.floor((seconds % (60 * 60)) / 60);
  return { hours: hour, minutes: minute };
};


const parseTimeTests = [
  {
    input: ['1'],
    output: { hours: 1, minutes: 0 },
  },
  {
    input: ['10:'],
    output: { hours: 10, minutes: 0 },
  },
  // it's less clear what this should be
  {
    input: ['10:1'],
    output: { hours: 10, minutes: 1 },
  },
];

export const parseTime = (s: string): Time => {
  if (s.length === 0) {
    return { hours: 0, minutes: 0 };
  }
  const idx = s.indexOf(':');
  return idx === -1 || idx === s.length - 1
    ? { hours: parseInt(s, 10), minutes: 0 }
    : {
      hours: parseInt(s.substring(0, idx), 10),
      minutes: parseInt(s.substring(idx + 1), 10),
    };
};

const padStart = (s: string, n: number, x: string): string => (s.length < n
  ? Array.from({ length: n - s.length })
    .map(() => x)
    .join('') + s
  : s);

const formatTimeTests = [
  { input: [{ hours: 1, minutes: 2 }], output: '01:02' },
  { input: [{ hours: 10, minutes: 20 }], output: '10:20' },
];

export const formatTime = (time: Time): string => {
  const result = `${padStart(`${time.hours}`, 2, '0')}:${padStart(
    `${time.minutes}`,
    2,
    '0',
  )}`;
  return result;
};

const makeBooleanTests = (valid: string[], invalid: string[]): Test[] => valid
  .map((x) => ({ input: [x], output: true }))
  .concat(invalid.map((x) => ({ input: [x], output: false })));

const validTests = makeBooleanTests(
  ['', '1', '10', '10:', '10:0', '10:01', '10:09', '24', '3'],
  ['a', '9', '1:9', '1:b', '10:001', '25', '30'],
);

export const valid = (s) => /^(0\d|1\d|2[0-3]|\d)?(:([0-5]\d?)?)?$/.test(s);

export const plus = (t: Time, d: Time): Time => {
  const remainder = t.minutes + d.minutes > 60 ? 1 : 0;
  return {
    hours: t.hours + d.hours + remainder,
    minutes: (t.minutes + d.minutes) % 60,
  };
};

export const fromMinutes = (x: number): Time => ({ hours: Math.floor(x / 60), minutes: x % 60 });

export const toMinutes = (x: Time): number => x.hours * 60 + x.minutes;

export const diff = (a: Time, b: Time): Time => fromMinutes(toMinutes(a) - toMinutes(b));

export const momentToTime = (m: Moment) => ({
  hours: m.hours(),
  minutes: m.minutes(),
});
