import moment from 'moment';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { createSelector, createStructuredSelector } from 'reselect';

import { fetchResource } from 'api/actions';
import { makeReservation } from 'api/actions/reservations';
import { currentUserSelector } from 'auth/selectors';
import { slotSize } from 'shared/availability-view';
import createFormSubmitHandler from 'utils/createFormSubmitHandler';
import ReservationForm from './ReservationForm';
import utils from './utils';

function datePropSelector(state, props) {
  return props.date;
}

function resourceSelector(state, props) {
  return props.resource;
}

function getInitialTime(date) {
  const begin = moment(date, moment.ISO_8601, true);
  if (begin.isValid() && date.indexOf('T') !== -1) {
    const end = begin.clone().add(slotSize, 'minutes');
    return {
      begin: {
        date: begin.format('YYYY-MM-DD'),
        time: begin.format('HH:mm'),
      },
      end: {
        date: end.format('YYYY-MM-DD'),
        time: end.format('HH:mm'),
      },
    };
  }
  return {
    begin: { date, time: null },
    end: { date, time: null },
  };
}

const initialValuesSelector = createSelector(
  currentUserSelector,
  resourceSelector,
  datePropSelector,
  (currentUser, resource, date) => ({
    hostName: currentUser ? currentUser.displayName : '',
    reserverName: currentUser ? currentUser.displayName : '',
    resource: resource.name.fi,
    time: getInitialTime(date),
  })
);

const formDateSelector = state => (
  state.form.resourceReservation &&
  state.form.resourceReservation.values.time.begin.date
);

const timelineDateSelector = createSelector(
  formDateSelector,
  initialValuesSelector,
  (formDate, initialValues) => formDate || initialValues.time.begin.date
);

export const selector = createStructuredSelector({
  initialValues: initialValuesSelector,
  timelineDate: timelineDateSelector,
});

const actions = {
  fetchResource,
  makeReservation,
};

function formatTime({ date, time }) {
  return moment(`${date}T${time}:00`).format();
}

export function mergeProps(stateProps, dispatchProps, ownProps) {
  const props = { ...ownProps, ...stateProps, ...dispatchProps };
  const callback = (actionOptions, values) => props.makeReservation(
    {
      begin: formatTime(values.time.begin),
      end: formatTime(values.time.end),
      event_description: values.eventDescription,
      event_subject: values.eventName,
      host_name: values.hostName,
      number_of_participants: values.numberOfParticipants,
      reserver_name: values.reserverName,
      resource: props.resource.id,
    },
    actionOptions
  );
  const successHandler = (action) => {
    const begin = utils.parseBeginDate(action);
    const url = utils.getResourceUrl(props.resource.id, begin);
    browserHistory.push(url);
  };
  return {
    ...props,
    onSubmit: (...args) => (
      createFormSubmitHandler(callback)(...args)
        .then(successHandler)
    ),
  };
}

export default connect(selector, actions, mergeProps)(ReservationForm);