import isEqual from 'lodash/isEqual';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import Loader from 'react-loader';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchResources } from 'api/actions';
import AvailabilityView from 'shared/availability-view';
import SearchControls from './search-controls';
import selector from './searchPageSelector';

export class UnconnectedSearchPageContainer extends Component {
  componentDidMount() {
    this.props.fetchResources(this.props.searchFilters);
  }

  componentWillUpdate(nextProps) {
    if (!isEqual(this.props.searchFilters, nextProps.searchFilters)) {
      this.props.fetchResources(nextProps.searchFilters);
    }
  }

  render() {
    const {
      availabilityGroups,
      isFetching,
      resultsCount,
      searchFilters,
    } = this.props;

    const searchResultsText = resultsCount === 1 ?
      `Löytyi ${resultsCount} hakuehdot täyttävä tila.` :
      `Löytyi ${resultsCount} hakuehdot täyttävää tilaa.`;
    return (
      <div className="search-page">
        <h1>Hae tiloja</h1>
        <SearchControls initialValues={searchFilters} />
        <Loader loaded={!isFetching}>
          <div className="search-results-count">
            <span>{searchResultsText} </span>
            <Link to="/">Tyhjennä haku.</Link>
          </div>
          <AvailabilityView
            date={moment(searchFilters.date)}
            groups={availabilityGroups}
            onDateChange={() => null}
          />
        </Loader>
      </div>
    );
  }
}

const availabilityGroupShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  resources: PropTypes.array.isRequired,
});

UnconnectedSearchPageContainer.propTypes = {
  availabilityGroups: PropTypes.arrayOf(availabilityGroupShape).isRequired,
  isFetching: PropTypes.bool.isRequired,
  fetchResources: PropTypes.func.isRequired,
  resultsCount: PropTypes.number.isRequired,
  searchFilters: PropTypes.object.isRequired,
};

const actions = {
  fetchResources,
};

export default connect(selector, actions)(UnconnectedSearchPageContainer);
