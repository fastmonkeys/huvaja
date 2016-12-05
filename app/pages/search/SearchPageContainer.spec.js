import { expect } from 'chai';
import { shallow } from 'enzyme';
import { decamelizeKeys } from 'humps';
import queryString from 'query-string';
import React from 'react';
import Loader from 'react-loader';
import { browserHistory, Link } from 'react-router';
import simple from 'simple-mock';

import AvailabilityView from 'shared/availability-view';
import { UnconnectedSearchPageContainer as SearchPageContainer } from './SearchPageContainer';
import SearchControls from './search-controls';

describe('pages/search/SearchPageContainer', () => {
  const defaultProps = {
    availabilityGroups: [
      { name: 'Group 1', resources: ['r-1', 'r-2'] },
    ],
    isFetching: false,
    fetchResources: () => null,
    resultsCount: 0,
    searchFilters: { date: '2016-12-12', search: 'search text', isFavorite: '' },
  };

  function getWrapper(props) {
    return shallow(<SearchPageContainer {...defaultProps} {...props} />);
  }

  function getResultsCountWrapper(props) {
    return getWrapper(props).find('.search-results-count');
  }

  describe('render', () => {
    describe('when resources are fetched', () => {
      let wrapper;
      const isFetching = true;
      const resources = [
        { id: 'r-1', name: { fi: 'Resurssi 1' } },
        { id: 'r-2', name: { fi: 'Resurssi 2' } },
      ];

      before(() => {
        wrapper = getWrapper({ isFetching, resources });
      });

      it('renders a header with correct text', () => {
        const header = wrapper.find('h1');
        expect(header.length).to.equal(1);
        expect(header.text()).to.equal('Hae tiloja');
      });

      it('renders SearchControls with correct props', () => {
        const searchControls = wrapper.find(SearchControls);
        expect(searchControls).to.have.length(1);
        expect(searchControls.prop('initialValues')).to.deep.equal(defaultProps.searchFilters);
      });

      it('renders AvailabilityView with correct props', () => {
        const availabilityView = wrapper.find(AvailabilityView);
        expect(availabilityView).to.have.length(1);
        expect(availabilityView.prop('groups')).to.deep.equal(defaultProps.availabilityGroups);
        expect(availabilityView.prop('onDateChange')).to.equal(wrapper.instance().handleDateChange);
      });

      describe('results count', () => {
        it('renders correct text if results is 0', () => {
          const resultsCount = getResultsCountWrapper();
          expect(resultsCount.text()).to.contain('Löytyi 0 hakuehdot täyttävää tilaa');
        });

        it('renders correct text if results is 1', () => {
          const resultsCount = getResultsCountWrapper({ resultsCount: 1 });
          expect(resultsCount.text()).to.contain('Löytyi 1 hakuehdot täyttävä tila');
        });

        it('renders correct text if results is greater than 1', () => {
          const resultsCount = getResultsCountWrapper({ resultsCount: 4 });
          expect(resultsCount.text()).to.contain('Löytyi 4 hakuehdot täyttävää tilaa');
        });

        it('renders a Link with correct props for clearing search results', () => {
          const resultsCount = getResultsCountWrapper();
          const link = resultsCount.find(Link);
          expect(link.prop('to')).to.equal('/');
          expect(link.prop('children')).to.equal('Tyhjennä haku.');
        });
      });
    });

    describe('when resources are not fetched', () => {
      let wrapper;
      const isFetching = false;
      const resources = [];

      before(() => {
        wrapper = getWrapper({ isFetching, resources });
      });

      it('renders a Loader', () => {
        const loader = wrapper.find(Loader);
        expect(loader).to.have.length(1);
      });

      it('renders SearchControls with correct props', () => {
        const searchControls = wrapper.find(SearchControls);
        expect(searchControls).to.have.length(1);
        expect(searchControls.prop('initialValues')).to.deep.equal(defaultProps.searchFilters);
      });
    });
  });

  describe('componentDidMount', () => {
    it('fetches resources using search filters', () => {
      const fetchResources = simple.mock();
      const instance = getWrapper({ fetchResources }).instance();
      instance.componentDidMount();
      expect(fetchResources.callCount).to.equal(1);
      expect(fetchResources.lastCall.arg).to.deep.equal(defaultProps.searchFilters);
    });
  });

  describe('componentWillUpdate', () => {
    describe('when searchFilters prop changes', () => {
      const fetchResources = simple.mock();
      const searchFilters = { date: '2016-11-11', search: 'search text', isFavorite: '' };
      const nextProps = {
        searchFilters: {
          date: '2016-12-12',
          search: 'new search',
          isFavorite: 'true',
        },
      };

      before(() => {
        const instance = getWrapper({ fetchResources, searchFilters }).instance();
        instance.state = searchFilters;
        instance.componentWillUpdate(nextProps);
      });

      it('fetches resources using search filters', () => {
        expect(fetchResources.callCount).to.equal(1);
        expect(fetchResources.lastCall.arg).to.deep.equal(nextProps.searchFilters);
      });
    });

    describe('when searchFilters prop does not change', () => {
      const fetchResources = simple.mock();
      const searchFilters = { date: '2016-12-12', search: 'search text', isFavorite: '' };
      const nextProps = { searchFilters };

      before(() => {
        const instance = getWrapper({ fetchResources, searchFilters }).instance();
        instance.state = searchFilters;
        instance.componentWillUpdate(nextProps);
      });

      it('does not fetch resources', () => {
        expect(fetchResources.callCount).to.equal(0);
      });
    });
  });

  describe('handleDateChange', () => {
    const searchFilters = {
      date: '2016-12-12',
      search: 'search text',
      isFavorite: '',
    };
    const newDate = '2016-12-13';
    let browserHistoryMock;
    let instance;

    before(() => {
      browserHistoryMock = simple.mock(browserHistory, 'push');
      instance = getWrapper({ searchFilters }).instance();
      instance.handleDateChange(newDate);
    });

    after(() => {
      simple.restore();
    });

    it('changes the url with current search filters and new date', () => {
      const actualPath = browserHistoryMock.lastCall.args[0];
      const expectedFilters = decamelizeKeys({ ...searchFilters, date: newDate });
      const expectedPath = `/?${queryString.stringify(expectedFilters)}`;

      expect(browserHistoryMock.callCount).to.equal(1);
      expect(actualPath).to.equal(expectedPath);
    });
  });
});
