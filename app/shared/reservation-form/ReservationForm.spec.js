import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import { Field } from 'redux-form';
import simple from 'simple-mock';

import AlertText from 'shared/alert-text';
import CompactReservationList from 'shared/compact-reservation-list';
import ReduxFormField from 'shared/form-fields/ReduxFormField';
import RecurringReservationControls from 'shared/recurring-reservation-controls';
import timeUtils from 'utils/timeUtils';
import { UnconnectedReservationForm as ReservationForm, validate } from './ReservationForm';

describe('shared/reservation-form/ReservationForm', () => {
  const defaults = {
    allowRecurring: true,
    baseReservation: { begin: 'bar', end: 'foo' },
    isOrderingCatering: false,
    isRecurring: false,
    timelineDate: '2016-01-01',
    fetchCateringProducts: () => null,
    fetchCateringProductCategories: () => null,
    fetchResource: () => null,
    handleSubmit: () => null,
    numberOfParticipants: null,
    recurringReservations: [{ begin: 'foo', end: 'bar' }],
    removeRecurringReservation: () => null,
    reservation: null,
    resource: { id: '123', peopleCapacity: 10 },
    onDateChange: () => null,
    submitting: false,
    timeRange: {
      begin: {},
      end: {},
    },
  };
  function getWrapper(props) {
    return shallow(<ReservationForm {...defaults} {...props} />);
  }

  describe('validation', () => {
    describe('if field value is missing', () => {
      const values = {};

      it('returns an error if field is in requiredFields', () => {
        const errors = validate(values);
        expect(errors.time).to.equal('Pakollinen tieto');
        expect(errors.resource).to.equal('Pakollinen tieto');
        expect(errors.eventSubject).to.equal('Pakollinen tieto');
        expect(errors.numberOfParticipants).to.equal('Pakollinen tieto');
      });
    });

    describe('if field has a value', () => {
      it('does not return an error even if field is required', () => {
        const values = {
          time: {
            begin: {
              date: '2016-01-01',
              time: '10:00',
            },
            end: {
              date: '2016-01-01',
              time: '11:00',
            },
          },
          resource: '123',
          eventSubject: 'name',
          numberOfParticipants: 21,
        };
        const errors = validate(values);
        expect(errors.time).to.not.exist;
        expect(errors.resource).to.not.exist;
        expect(errors.eventSubject).to.not.exist;
        expect(errors.numberOfParticipants).to.not.exist;
      });
    });

    describe('time', () => {
      function getError(time) {
        const values = {
          time: {
            begin: { date: '2016-01-01', time: '10:00' },
            end: { date: '2016-01-01', time: '11:00' },
            ...time,
          },
        };
        return validate(values).time;
      }

      it('has error when invalid begin time', () => {
        const error = getError({ begin: { date: '2016-01-01', time: '10:0-' } });
        expect(error).to.equal('Epäkelpo päivä tai aika');
      });

      it('has error when invalid end time', () => {
        const error = getError({ end: { date: '2016-01-01', time: '10:0-' } });
        expect(error).to.equal('Epäkelpo päivä tai aika');
      });

      it('has error when end time before begin', () => {
        const error = getError({
          begin: { date: '2016-01-01', time: '10:30' },
          end: { date: '2016-01-01', time: '10:00' },
        });
        expect(error).to.equal('Alkamisajan on oltava ennen loppumisaikaa');
      });

      const invalidMinutesMessage = 'Minuutin on oltava jaollinen viidellä, esim. 00, 05, 10, 15 jne.';
      it('has error when begin time has invalid minutes', () => {
        const minutes = ['01', '06', '11', '24', '29', '31', '44', '51', '56', '59'];
        minutes.forEach((minute) => {
          const error = getError({
            begin: { date: '2016-01-01', time: `10:${minute}` },
          });
          expect(error).to.equal(invalidMinutesMessage);
        });
      });

      it('has error when end time has invalid minutes', () => {
        const minutes = ['01', '06', '11', '24', '29', '31', '44', '51', '56', '59'];
        minutes.forEach((minute) => {
          const error = getError({
            end: { date: '2016-01-01', time: `10:${minute}` },
          });
          expect(error).to.equal(invalidMinutesMessage);
        });
      });
    });
  });

  describe('rendering', () => {
    it('renders a Form component', () => {
      const form = getWrapper().find('form');
      expect(form.length).to.equal(1);
    });

    describe('form fields', () => {
      let fields;

      before(() => {
        fields = getWrapper().find(Field);
      });

      it('length is 10', () => {
        expect(fields).to.have.length(10);
      });

      it('has a reservation time field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          label: 'Aika*',
          name: 'time',
          type: 'reservation-time',
        });
        expect(field).to.have.length(1);
      });

      it('has a time field', () => {
        const wrapper = getWrapper();
        const field = wrapper.find('.timeline-container').find(Field);
        expect(field.prop('label')).to.equal('Aika*');
        expect(field.prop('component')).to.equal(ReduxFormField);
        expect(field.prop('name')).to.equal('time');
        expect(field.prop('type')).to.equal('reservation-time');
        expect(field.prop('controlProps').date).to.equal(defaults.timelineDate);
        expect(field.prop('controlProps').hideDateSelector).to.be.true;
        expect(field.prop('controlProps').resource).to.equal(defaults.resource);
      });

      it('time field excludes reservation when exists', () => {
        const reservation = { id: 23 };
        const wrapper = getWrapper({ reservation });
        const field = wrapper.find('.timeline-container').find(Field);
        expect(field.prop('controlProps').excludeReservation).to.equal(23);
      });

      it('has a datetimerange field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: { required: true },
          label: 'Varauksen aika*',
          name: 'time',
          type: 'date-time-range',
        });
        expect(field).to.have.length(1);
      });

      it('has a resource field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: {
            resource: defaults.resource,
            timeRange: defaults.timeRange,
          },
          label: 'Tila*',
          name: 'resource',
          type: 'resource',
        });
        expect(field).to.have.length(1);
      });

      it('has a eventSubject field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: {},
          label: 'Varauksen otsikko*',
          name: 'eventSubject',
          type: 'text',
        });
        expect(field).to.have.length(1);
      });

      it('has a reserverName field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: {},
          label: 'Varaaja*',
          name: 'reserverName',
          type: 'text',
        });
        expect(field).to.have.length(1);
      });

      it('has a hostName field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: {},
          label: 'Varauksen isäntä*',
          name: 'hostName',
          type: 'text',
        });
        expect(field).to.have.length(1);
      });

      it('has a numberOfParticipants field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: {},
          label: 'Osallistujien määrä*',
          name: 'numberOfParticipants',
          type: 'number',
        });
        expect(field).to.have.length(1);
      });

      it('has a participants field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: { rows: 6 },
          label: 'Lista osallistujista',
          name: 'participants',
          type: 'textarea',
        });
        expect(field).to.have.length(1);
      });

      it('has a eventDescription field', () => {
        const field = fields.filter({
          component: ReduxFormField,
          controlProps: { rows: 6 },
          label: 'Lisätietoja',
          name: 'eventDescription',
          type: 'textarea',
        });
        expect(field).to.have.length(1);
      });

      describe('isRecurring field', () => {
        it('exists', () => {
          const field = fields.filter({
            component: ReduxFormField,
            controlProps: {
              className: 'is-recurring-checkbox',
              disabled: false,
            },
            label: 'Tee toistuva varaus',
            name: 'isRecurring',
            type: 'checkbox',
          });
          expect(field).to.have.length(1);
        });

        it('is disabled when not checked and no baseReservation', () => {
          const props = {
            baseReservation: null,
            isRecurring: false,
          };
          const field = fields = getWrapper(props).find(Field).filter({
            name: 'isRecurring',
            controlProps: {
              disabled: true,
            },
          });
          expect(field).to.have.length(1);
        });

        it('is disabled when not checked and catering order exists', () => {
          const props = {
            isOrderingCatering: true,
            isRecurring: false,
          };
          const field = fields = getWrapper(props).find(Field).filter({
            name: 'isRecurring',
            controlProps: {
              disabled: true,
            },
          });
          expect(field).to.have.length(1);
        });
      });
    });

    describe('"recurring disabled" reason', () => {
      it('is shown when isOrderingCatering prop is true', () => {
        const wrapper = getWrapper({ isOrderingCatering: true });
        const reason = wrapper.find('.recurring-disabled-reason');
        expect(reason).to.have.length(1);
        expect(reason.text()).to.contain(
          'Toistuvaa varausta ei voi tehdä, kun varaukseen sisältyy ' +
          'tarjoilutilaus.'
        );
      });

      it('is not shown when isOrderingCatering prop is false', () => {
        const wrapper = getWrapper({ isOrderingCatering: false });
        const reason = wrapper.find('.recurring-disabled-reason');
        expect(reason).to.have.length(0);
      });
    });

    describe('recurring reservations', () => {
      describe('when isRecurring is true', () => {
        it('does not render timeline', () => {
          const wrapper = getWrapper({ isRecurring: true });
          const timeline = wrapper.find('.timeline-container');
          expect(timeline).to.have.length(0);
        });

        it('renders RecurringReservationControls', () => {
          const wrapper = getWrapper({ isRecurring: true });
          const controls = wrapper.find(RecurringReservationControls);
          expect(controls).to.have.length(1);
        });

        it('renders compact list of reservations', () => {
          const wrapper = getWrapper({ isRecurring: true });
          const list = wrapper.find(CompactReservationList);
          expect(list).to.have.length(1);
          expect(list.prop('onRemoveClick')).to.equal(defaults.removeRecurringReservation);
          expect(list.prop('removableReservations')).to.deep.equal(defaults.recurringReservations);
          expect(list.prop('reservations')).to.deep.equal([defaults.baseReservation]);
        });
      });

      describe('when isRecurring is false', () => {
        it('does not render RecurringReservationControls', () => {
          const wrapper = getWrapper({ isRecurring: false });
          const controls = wrapper.find(RecurringReservationControls);
          expect(controls).to.have.length(0);
        });

        it('does not render compact list of reservations', () => {
          const wrapper = getWrapper({ isRecurring: false });
          const list = wrapper.find(CompactReservationList);
          expect(list).to.have.length(0);
        });
      });
    });

    describe('resource field', () => {
      function getResourceFieldWrapper(props) {
        const wrapper = getWrapper(props);
        return wrapper.find(Field).filter({ name: 'resource' });
      }

      describe('allowedCateringProvider', () => {
        it('is null when not ordering catering', () => {
          const props = {
            isOrderingCatering: false,
            cateringProvider: { id: 78 },
          };
          const wrapper = getResourceFieldWrapper(props);
          const actual = wrapper.prop('controlProps').allowedCateringProvider;
          expect(actual).to.be.null;
        });

        it('is cateringProvider prop when ordering catering', () => {
          const props = {
            isOrderingCatering: true,
            cateringProvider: { id: 78 },
          };
          const wrapper = getResourceFieldWrapper(props);
          const actual = wrapper.prop('controlProps').allowedCateringProvider;
          expect(actual).to.deep.equal(props.cateringProvider);
        });
      });
    });

    describe('catering field', () => {
      const props = {
        component: ReduxFormField,
        label: 'Tarjoilutilaus',
        name: 'cateringOrder',
        type: 'cateringOrder',
      };

      it('exists if cateringProvider exists', () => {
        const wrapper = getWrapper({ cateringProvider: { id: 1 } });
        const fields = wrapper.find(Field);
        const field = fields.filter(props);
        expect(field).to.have.length(1);
      });

      it('does not exist if cateringProvider does not exist', () => {
        const wrapper = getWrapper({ cateringProvider: null });
        const fields = wrapper.find(Field);
        const field = fields.filter(props);
        expect(field).to.have.length(0);
      });

      it('gets disabledReason if isRecurring prop is true', () => {
        const wrapper = getWrapper({
          cateringProvider: { id: 1 },
          isRecurring: true,
        });
        const fields = wrapper.find(Field);
        const field = fields.filter(props);
        expect(field.prop('controlProps').disabledReason).to.contain(
          'Tarjoilutilauksia ei voi tehdä toistuviin varauksiin.'
        );
      });

      it('gets null as disabledReason if isRecurring prop is false', () => {
        const wrapper = getWrapper({
          cateringProvider: { id: 1 },
          isRecurring: false,
        });
        const fields = wrapper.find(Field);
        const field = fields.filter(props);
        expect(field.prop('controlProps').disabledReason).to.be.null;
      });
    });

    describe('form buttons', () => {
      let buttons;

      before(() => {
        buttons = getWrapper().find(Button);
      });

      it('renders two buttons', () => {
        expect(buttons.length).to.equal(2);
      });

      describe('the first button', () => {
        it('has text "Peruuta"', () => {
          expect(buttons.at(0).props().children).to.equal('Peruuta');
        });
      });

      describe('the second button', () => {
        it('has text "Tallenna varaus"', () => {
          expect(buttons.at(1).props().children).to.equal('Tallenna varaus');
        });

        it('has text "Tallennetaan..." when submitting', () => {
          const props = { submitting: true };
          const button = getWrapper(props).find(Button).at(1);
          expect(button.props().children).to.equal('Tallennetaan...');
        });
      });
    });

    describe('warning', () => {
      it('warns about numberOfParticipants > peopleCapacity', () => {
        const props = {
          numberOfParticipants: 11,
        };
        const warning = getWrapper(props).find('.reservation-form-warning');
        expect(warning.is(AlertText)).to.be.true;
        const text = (
          'Huomaa että osallistujia on enemmän kuin tilassa on istumapaikkoja.'
        );
        expect(warning.prop('text')).to.equal(text);
        expect(warning.prop('type')).to.equal('warning');
      });

      it('does not warn about numberOfParticipants = peopleCapacity', () => {
        const props = {
          numberOfParticipants: 10,
        };
        const warning = getWrapper(props).find('.reservation-form-warning');
        expect(warning).to.have.length(0);
      });
    });

    describe('error', () => {
      it('is rendered', () => {
        const props = {
          error: 'Some error.',
        };
        const error = getWrapper(props).find('.reservation-form-error');
        expect(error.is(AlertText)).to.be.true;
        expect(error.prop('text')).to.equal('Some error.');
        expect(error.prop('type')).to.equal('error');
      });
    });
  });

  describe('lifecycle methods', () => {
    describe('componentDidMount', () => {
      it('fetches resource for correct date and resource', () => {
        const fetchResource = simple.mock();
        const instance = getWrapper({ fetchResource }).instance();
        instance.componentDidMount();
        expect(fetchResource.callCount).to.equal(1);
        expect(fetchResource.lastCall.args[0]).to.equal(defaults.resource.id);
        expect(fetchResource.lastCall.args[1]).to.deep.equal({
          date: defaults.timelineDate,
        });
      });

      it('does not fetch if no resource', () => {
        const fetchResource = simple.mock();
        const props = { fetchResource, resource: null };
        const instance = getWrapper(props).instance();
        instance.componentDidMount();
        expect(fetchResource.callCount).to.equal(0);
      });

      it('fetches products and categories if provider', () => {
        const fetchCateringProducts = simple.mock();
        const fetchCateringProductCategories = simple.mock();
        const cateringProvider = { id: 4 };
        const props = { cateringProvider, fetchCateringProducts, fetchCateringProductCategories };
        const instance = getWrapper(props).instance();
        instance.componentDidMount();
        expect(fetchCateringProducts.callCount).to.equal(1);
        expect(fetchCateringProducts.lastCall.args).to.deep.equal([4]);
        expect(fetchCateringProductCategories.callCount).to.equal(1);
        expect(fetchCateringProductCategories.lastCall.args).to.deep.equal([4]);
      });

      it('does not fetch products and categories if no provider', () => {
        const fetchCateringProducts = simple.mock();
        const fetchCateringProductCategories = simple.mock();
        const cateringProvider = null;
        const props = { cateringProvider, fetchCateringProducts, fetchCateringProductCategories };
        const instance = getWrapper(props).instance();
        instance.componentDidMount();
        expect(fetchCateringProducts.called).to.be.false;
        expect(fetchCateringProductCategories.called).to.be.false;
      });
    });

    describe('componentWillReceiveProps', () => {
      it('fetches resource for new timelineDate when timelineDate changes', () => {
        const fetchResource = simple.mock();
        const instance = getWrapper({ fetchResource }).instance();
        const nextProps = {
          resource: defaults.resource,
          timelineDate: '2016-01-02',
        };
        instance.componentWillReceiveProps(nextProps);
        expect(fetchResource.callCount).to.equal(1);
        expect(fetchResource.lastCall.args[0]).to.equal(nextProps.resource.id);
        expect(fetchResource.lastCall.args[1]).to.deep.equal({
          date: nextProps.timelineDate,
        });
      });

      it('fetches resource for new resource when resource changes', () => {
        const fetchResource = simple.mock();
        const instance = getWrapper({ fetchResource }).instance();
        const nextProps = {
          resource: { id: '555' },
          timelineDate: defaults.timelineRange,
        };
        instance.componentWillReceiveProps(nextProps);
        expect(fetchResource.callCount).to.equal(1);
        expect(fetchResource.lastCall.args[0]).to.equal(nextProps.resource.id);
        expect(fetchResource.lastCall.args[1]).to.deep.equal({
          date: nextProps.timelineDate,
        });
      });

      it('does not fetch resource when timelineDate does not change', () => {
        const fetchResource = simple.mock();
        const instance = getWrapper({ fetchResource }).instance();
        const nextProps = {
          resource: defaults.resource,
          timelineDate: defaults.timelineDate,
        };
        instance.componentWillReceiveProps(nextProps);
        expect(fetchResource.callCount).to.equal(0);
      });

      it('does not fetch when no resource', () => {
        const fetchResource = simple.mock();
        const props = { fetchResource };
        const instance = getWrapper(props).instance();
        const nextProps = {
          resource: null,
          timelineDate: '2016-01-02',
        };
        instance.componentWillReceiveProps(nextProps);
        expect(fetchResource.callCount).to.equal(0);
      });

      it('changes base time when time range changes', () => {
        const changeBaseTime = simple.mock();
        const timeRange = {
          begin: {
            date: '2016-01-01',
            time: '10:00',
          },
          end: {
            date: '2016-01-01',
            time: '11:00',
          },
        };
        const props = { changeBaseTime, timeRange };
        const instance = getWrapper(props).instance();
        const newRange = {
          ...timeRange,
          end: {
            date: '2016-01-01',
            time: '12:00',
          },
        };
        const nextProps = { timeRange: newRange };
        instance.componentWillReceiveProps(nextProps);
        expect(changeBaseTime.callCount).to.equal(1);
        expect(changeBaseTime.lastCall.arg).to.deep.equal(
          timeUtils.getDateTimeRangeFieldMoments(newRange)
        );
      });

      describe('fetching products and categories', () => {
        function getFetchingCallData(prevProvider, nextProvider) {
          const fetchCateringProducts = simple.mock();
          const fetchCateringProductCategories = simple.mock();
          const wrapper = getWrapper({
            cateringProvider: prevProvider,
            fetchCateringProducts,
            fetchCateringProductCategories,
          });
          const instance = wrapper.instance();
          instance.componentWillReceiveProps({
            ...wrapper.props(),
            cateringProvider: nextProvider,
          });
          return { fetchCateringProducts, fetchCateringProductCategories };
        }

        function testCalled(mocks, providerId) {
          expect(mocks.fetchCateringProducts.callCount).to.equal(1);
          expect(mocks.fetchCateringProducts.lastCall.args).to.deep.equal([providerId]);
          expect(mocks.fetchCateringProductCategories.callCount).to.equal(1);
          expect(mocks.fetchCateringProductCategories.lastCall.args).to.deep.equal([providerId]);
        }

        function testNotCalled(mocks) {
          expect(mocks.fetchCateringProducts.called).to.be.false;
          expect(mocks.fetchCateringProductCategories.called).to.be.false;
        }

        it('is done if provider added', () => {
          const data = getFetchingCallData(null, { id: 5 });
          testCalled(data, 5);
        });

        it('is done if provider changes', () => {
          const data = getFetchingCallData({ id: 9 }, { id: 10 });
          testCalled(data, 10);
        });

        it('is not done if provider removed', () => {
          const data = getFetchingCallData({ id: 5 }, null);
          testNotCalled(data);
        });

        it('is not done if provider does not change', () => {
          const data = getFetchingCallData({ id: 10 }, { id: 10 });
          testNotCalled(data);
        });
      });
    });
  });
});
