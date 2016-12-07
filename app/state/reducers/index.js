import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { activeRequestsReducer, dataReducer } from 'api/reducers';
import authReducer from 'auth/reducer';
import cateringReducer from './cateringReducer';
import formPlugins from './formPlugins';
import resourcePage from './resourcePageReducer';
import searchFilters from './searchFiltersReducer';
import searchResults from './searchResultsReducer';

export default combineReducers({
  activeRequests: activeRequestsReducer,
  auth: authReducer,
  catering: cateringReducer,
  data: dataReducer,
  form: formReducer.plugin(formPlugins),
  resourcePage,
  searchPage: combineReducers({
    searchFilters,
    searchResults,
  }),
});
