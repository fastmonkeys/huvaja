import { expect } from 'chai';
import moment from 'moment';
import simple from 'simple-mock';

import { getState } from 'utils/testUtils';
import { mergeProps, selector } from './ReservationEditFormContainer';

describe('shared/reservation-form/ReservationEditFormContainer', () => {
  const reservation = {
    begin: '2017-04-26T10:00:00+03:00',
    end: '2017-04-26T15:30:00+03:00',
    eventDescription: 'description',
    eventSubject: 'Tivin osastokokous',
    hostName: 'Markku Raitio',
    id: 123,
    numberOfParticipants: 30,
    reserverEmailAddress: 'email@example.com',
    reserverName: 'Jutta Laurila',
    reserverPhoneNumber: '123456789',
    resource: 'abc123',
    state: 'confirmed',
  };

  const resource = {
    id: 'abc123',
    name: {
      fi: 'resouceName',
    },
  };

  const extraResource = {
    id: 'cba321',
    name: {
      fi: 'extraResouceName',
    },
  };

  const defaultState = {
    data: {
      reservations: {
        123: reservation,
      },
      resources: {
        abc123: resource,
        cba321: extraResource,
      },
    },
  };

  describe('selector', () => {
    const props = { reservation };
    function getSelected(extraState, extraProps) {
      const state = getState({ ...defaultState, ...extraState });
      return selector(state, { ...props, ...extraProps });
    }

    describe('initialValues', () => {
      it('time is correct', () => {
        expect(getSelected().initialValues.time).to.deep.equal({
          begin: {
            date: '2017-04-26',
            time: '10:00',
          },
          end: {
            date: '2017-04-26',
            time: '15:30',
          },
        });
      });

      it('eventDescription is reservation.eventDescription', () => {
        expect(getSelected().initialValues.eventDescription).to.equal(reservation.eventDescription);
      });

      it('eventName is reservation.eventSubject', () => {
        expect(getSelected().initialValues.eventName).to.equal(reservation.eventSubject);
      });

      it('hostName is reservation.hostName', () => {
        expect(getSelected().initialValues.hostName).to.equal(reservation.hostName);
      });

      it('numberOfParticipants is reservation.numberOfParticipants', () => {
        expect(getSelected().initialValues.numberOfParticipants).to.equal(
          reservation.numberOfParticipants
        );
      });

      it('reserverName is reservation.reserverName', () => {
        expect(getSelected().initialValues.reserverName).to.equal(reservation.reserverName);
      });
    });

    describe('timelineDate', () => {
      it('returns form date if exists', () => {
        const extraState = {
          'form.resourceReservation.values': {
            time: { begin: { date: '2016-01-01', time: '10:00' } },
          },
        };
        expect(getSelected(extraState).timelineDate).to.equal('2016-01-01');
      });

      it('returns reservation start date if no form date', () => {
        expect(getSelected().timelineDate).to.equal(
          moment(reservation.begin).format('YYYY-MM-DD')
        );
      });
    });
  });

  describe('mergeProps', () => {
    it('merges arguments and adds an onSubmit', () => {
      const actual = mergeProps(
        { a: 1 },
        { b: 2 },
        { c: 3 }
      );
      const { onSubmit, ...rest } = actual;
      expect(onSubmit).to.exist;
      expect(rest).to.deep.equal({ a: 1, b: 2, c: 3 });
    });

    describe('onSubmit', () => {
      function callOnSubmit(props, ...args) {
        const mergedProps = mergeProps({}, {}, props);
        mergedProps.onSubmit(...args);
      }

      it('calls props.editReservation', () => {
        const values = {
          time: {
            begin: { date: '2016-01-01', time: '10:00' },
            end: { date: '2016-01-01', time: '12:00' },
          },
          hostName: 'Han Solo',
          eventDescription: 'Description',
          eventName: 'Tapaaminen',
          numberOfParticipants: 8,
          reserverName: 'Luke Skywalker',
        };
        const editReservation = simple.mock();
        const props = {
          editReservation,
          reservation: { id: 123 },
          resource: { id: 'r1' },
        };
        callOnSubmit(props, values);
        expect(editReservation.callCount).to.equal(1);
        const args = editReservation.lastCall.args;
        expect(args).to.have.length(2);
        expect(args[0]).to.deep.equal({
          begin: moment('2016-01-01T10:00:00').format(),
          end: moment('2016-01-01T12:00:00').format(),
          event_description: values.eventDescription,
          event_subject: values.eventName,
          host_name: values.hostName,
          id: props.reservation.id,
          number_of_participants: values.numberOfParticipants,
          reserver_name: values.reserverName,
          resource: props.resource.id,
        });
      });
    });
  });
});