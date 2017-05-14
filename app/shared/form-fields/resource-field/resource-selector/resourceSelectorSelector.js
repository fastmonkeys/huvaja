import filter from 'lodash/filter';
import omit from 'lodash/omit';
import sortBy from 'lodash/sortBy';
import { createSelector, createStructuredSelector } from 'reselect';

import { resourcesGetIsActiveSelector } from 'api/selectors';

const selectedResourceIdSelector = (state, props) => props.selectedResourceId;
const resourcesSelector = state => state.data.resources;
const unitsSelector = state => state.data.units;
const availableResourceIdsSelector = state => (
  state.resourceSelector.availableResourceIds
);

const unavailableResourceIdsSelector = createSelector(
  resourcesSelector,
  availableResourceIdsSelector,
  (resources, availableIds) => Object.keys(omit(resources, availableIds))
);

const getResources = (ids, resources, units, excludedId) => {
  const cleaned = filter(ids, id => id !== excludedId);
  return cleaned.map((id) => {
    const resource = resources[id];
    const unit = units[resource.unit];
    return {
      id,
      label: `${unit.name.fi} / ${resource.name.fi}`,
      peopleCapacity: resource.peopleCapacity,
    };
  });
};
const availableSelector = createSelector(
  availableResourceIdsSelector,
  resourcesSelector,
  unitsSelector,
  selectedResourceIdSelector,
  getResources
);
const unavailableSelector = createSelector(
  unavailableResourceIdsSelector,
  resourcesSelector,
  unitsSelector,
  selectedResourceIdSelector,
  getResources
);

const sort = resources => sortBy(resources, 'label');
const sortedAvailableSelector = createSelector(
  availableSelector,
  availableResources => sort(availableResources)
);
const sortedUnavailableSelector = createSelector(
  unavailableSelector,
  unavailableResources => sort(unavailableResources)
);

export default createStructuredSelector({
  availableResources: sortedAvailableSelector,
  isFetching: resourcesGetIsActiveSelector,
  unavailableResources: sortedUnavailableSelector,
});