import React, { Component, PropTypes } from 'react';
import Loader from 'react-loader';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchResources } from 'api/actions';
import selector from './searchSelector';

function renderResource(resource) {
  return (
    <li key={resource.id}>
      <Link to={`/resources/${resource.id}`}>
        {resource.name.fi}
      </Link>
    </li>
  );
}

export class UnconnectedSearchContainer extends Component {
  componentDidMount() {
    this.props.fetchResources();
  }

  render() {
    const { isFetching, resources } = this.props;

    return (
      <div className="search">
        <h1>Tilat</h1>
        <Loader loaded={!isFetching}>
          <ul>
            {resources.map(renderResource)}
          </ul>
        </Loader>
      </div>
    );
  }
}

const resourceShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.shape({
    fi: PropTypes.string.isRequired,
  }).isRequired,
});

UnconnectedSearchContainer.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  fetchResources: PropTypes.func.isRequired,
  resources: PropTypes.arrayOf(resourceShape).isRequired,
};

const actions = {
  fetchResources,
};

export default connect(selector, actions)(UnconnectedSearchContainer);
