import React, { useState } from 'react';
import BarChartIcon from '@material-ui/icons/BarChart';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { ResponsivePie } from '@nivo/pie';
import { useSelector } from 'react-redux';
import { getEventsByName, useColors } from '../utils';
import './styles.scss';
import { Event, State } from '../types';

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
function MyResponsivePie() {
  const events = useSelector<State, Event[]>((state) => state.events);
  const getColor = useColors();

  if (events.length === 0) {
    return <div />;
  }

  const eventsByName = getEventsByName(events);
  const myData = eventsByName.map(([eventTitle, myEvents]) => ({
    id: eventTitle,
    value: myEvents.reduce((acc, event) => acc + event.endTime.diff(event.startTime, 'hours'), 0),
  }));

  return (
    <ResponsivePie
      data={myData}
      margin={{
        top: 40, right: 80, bottom: 80, left: 80,
      }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      colors={({ id }) => getColor(id)}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      radialLabelsSkipAngle={10}
      radialLabelsTextXOffset={6}
      radialLabelsTextColor="#333333"
      radialLabelsLinkOffset={0}
      radialLabelsLinkDiagonalLength={16}
      radialLabelsLinkHorizontalLength={24}
      radialLabelsLinkStrokeWidth={1}
      radialLabelsLinkColor={{ from: 'color' }}
      slicesLabelsSkipAngle={10}
      slicesLabelsTextColor="#333333"
      animate
      motionStiffness={90}
      motionDamping={15}
      defs={[
        {
          id: 'dots',
          type: 'patternDots',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: 'lines',
          type: 'patternLines',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        {
          match: {
            id: 'ruby',
          },
          id: 'dots',
        },
        {
          match: {
            id: 'c',
          },
          id: 'dots',
        },
        {
          match: {
            id: 'go',
          },
          id: 'dots',
        },
        {
          match: {
            id: 'python',
          },
          id: 'dots',
        },
        {
          match: {
            id: 'scala',
          },
          id: 'lines',
        },
        {
          match: {
            id: 'lisp',
          },
          id: 'lines',
        },
        {
          match: {
            id: 'elixir',
          },
          id: 'lines',
        },
        {
          match: {
            id: 'javascript',
          },
          id: 'lines',
        },
      ]}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          translateY: 56,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: '#999',
          symbolSize: 18,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#000',
              },
            },
          ],
        },
      ]}
    />
  );
}

export default function Stats() {
  const [showStats, setShowStats] = useState(false);
  const style = showStats ? { width: '50%', height: '50%' } : {};
  return (
    <div className="stats" style={style}>
      {!showStats
        && (
          <div className="showStatsButton-container">
            <IconButton onClick={() => setShowStats(!showStats)}>
              <BarChartIcon />
            </IconButton>
          </div>
        )}
      {showStats
        && (
          <div style={{ height: '100%', width: '100%', display: 'flex' }}>
            <MyResponsivePie />
            <IconButton
              className="closeStatsButton"
              onClick={() => setShowStats(false)}
            >
              <CloseIcon />
            </IconButton>
          </div>
        )}
    </div>
  );
}
