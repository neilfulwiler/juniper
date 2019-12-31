import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete';
import Fade from '@material-ui/core/Fade';
import TextField from '@material-ui/core/TextField';
import Popper from '@material-ui/core/Popper';
import classNames from 'classnames';

import {
  diff,
  formatTime,
  plus,
  parseTime,
  Time,
  Test,
  toMinutes,
  toTime,
  valid,
} from './utils';

import './styles.scss';

const times: Time[] = Array.from({ length: 24 * 4 }).map((_, idx) => toTime(15 * 60 * idx));

function Timepicker({
  initialValue,
  onChange,
  isValid,
}: {
  initialValue: Time;
  onChange: (t: Time) => void;
  isValid: (t: Time) => boolean;
}) {
  const [value, setValue] = useState(formatTime(initialValue));
  useEffect(() => {
    setValue(formatTime(initialValue));
  }, [initialValue]);
  const [firstPass, setFirstPass] = useState(true);
  const timepickerRef = useRef();
  const valueIsInvalid = !isValid(parseTime(value));
  return (
    <div
      id="timepicker"
      className={classNames({ invalid: valueIsInvalid })}
      ref={timepickerRef}
    >
      <Autocomplete
        includeInputInList
        freeSolo
        id="combo-box-demo"
        options={times}
        getOptionLabel={(option) => formatTime(option)}
        className="time-picker-autocomplete"
        inputValue={value}
        autoHighlight
        disableClearable
        onBlur={() => onChange(parseTime(value))}
        onChange={(_, value) => {
          const actualValue = typeof value === 'string' ? parseTime(value) : value;
          if (!isValid(actualValue)) {
            return;
          }
          onChange(actualValue);
        }}
        onInputChange={(_, value) => {
          if (firstPass) {
            // so.. onInputChange seems to get called immediately with an empty
            // string. this is an attempt to avoid that behavior
            setFirstPass(false);
            return;
          }
          valid(value) && setValue(value);
        }}
        filterOptions={createFilterOptions({
          matchFrom: 'any',
          stringify: (option) => formatTime(option),
        })}
        renderInput={(params) => <TextField {...params} variant="outlined" fullWidth />}
      />
      {timepickerRef && valueIsInvalid && (
        <Popper
          placement="top-start"
          open
          anchorEl={timepickerRef.current}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <div className="validation-failure">
                Event must end after it starts.
              </div>
            </Fade>
          )}
        </Popper>
      )}
    </div>
  );
}

export default function TimeRangePicker({ range, onRangeChange }) {
  const [start, end] = range;
  return (
    <div className="time-range">
      <Timepicker
        initialValue={start}
        onChange={(newStart) => {
          onRangeChange([newStart, plus(newStart, diff(end, start))]);
        }}
        isValid={(time) => {
          const isValid = toMinutes(time) < toMinutes(end);
          console.log(
            `${formatTime(time)}-${formatTime(end)}, isValid: ${isValid}`,
          );
          return isValid;
        }}
      />
      &#x2014;
      <Timepicker
        initialValue={end}
        onChange={(newEnd) => onRangeChange([start, newEnd])}
        isValid={(time) => toMinutes(start) < toMinutes(time)}
      />
    </div>
  );
}
