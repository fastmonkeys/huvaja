import React, { PropTypes } from 'react';

import DateSelector from './DateSelector';
import TimelineGroup from './TimelineGroups/TimelineGroup';

SingleAvailabilityView.propTypes = {
  date: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
};
export default function SingleAvailabilityView(props) {
  return (
    <div className="availability-view availability-view-single">
      <DateSelector value={props.date} onChange={props.onDateChange} />
      <TimelineGroup date={props.date} resources={[props.resource]} />
    </div>
  );
}