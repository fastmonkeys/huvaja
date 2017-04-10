import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import simple from 'simple-mock';

import DatePicker from 'shared/date-picker';
import DateTimeRange from './DateTimeRange';
import Field from './Field';
import Time from './Time';

function getWrapper(props) {
  const defaults = {
    controlProps: {
      onChange: () => null,
      value: { begin: {}, end: {} },
    },
    id: '1234',
  };
  return shallow(<DateTimeRange {...defaults} {...props} />);
}

describe('shared/form-fields/DateTimeRange', () => {
  it('renders a div.date-time-range-field', () => {
    const wrapper = getWrapper();
    expect(wrapper.is('div.date-time-range-field')).to.be.true;
  });

  it('renders correct fields', () => {
    const fields = getWrapper().find(Field);
    expect(fields).to.have.length(3);
    expect(fields.at(0).prop('componentClass')).to.equal(DatePicker);
    expect(fields.at(1).prop('componentClass')).to.equal(Time);
    expect(fields.at(2).prop('componentClass')).to.equal(Time);
  });

  describe('handleDateChange', () => {
    it('updates begin.date and end.date', () => {
      const date = 'date2';
      const onChange = simple.mock();
      const value = {
        begin: { date: 'date1', time: 'time1' },
        end: { date: 'date1', time: 'time2' },
      };
      const wrapper = getWrapper({ controlProps: { onChange, value } });
      wrapper.instance().handleDateChange(date);
      expect(onChange.callCount).to.equal(1);
      expect(onChange.lastCall.args).to.deep.equal([{
        begin: { date, time: 'time1' },
        end: { date, time: 'time2' },
      }]);
    });
  });

  describe('handleStartTimeChange', () => {
    it('updates begin.time', () => {
      const time = 'new-start-time';
      const onChange = simple.mock();
      const value = {
        begin: { date: 'date1', time: 'time1' },
        end: { date: 'date1', time: 'time2' },
      };
      const wrapper = getWrapper({ controlProps: { onChange, value } });
      wrapper.instance().handleStartTimeChange(time);
      expect(onChange.callCount).to.equal(1);
      expect(onChange.lastCall.args).to.deep.equal([{
        begin: { date: 'date1', time },
        end: { date: 'date1', time: 'time2' },
      }]);
    });
  });

  describe('handleEndTimeChange', () => {
    it('updates end.time', () => {
      const time = 'new-start-time';
      const onChange = simple.mock();
      const value = {
        begin: { date: 'date1', time: 'time1' },
        end: { date: 'date1', time: 'time2' },
      };
      const wrapper = getWrapper({ controlProps: { onChange, value } });
      wrapper.instance().handleEndTimeChange(time);
      expect(onChange.callCount).to.equal(1);
      expect(onChange.lastCall.args).to.deep.equal([{
        begin: { date: 'date1', time: 'time1' },
        end: { date: 'date1', time },
      }]);
    });
  });
});
