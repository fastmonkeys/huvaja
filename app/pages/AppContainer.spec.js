import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import DocumentTitle from 'react-document-title';
import Loader from 'react-loader';
import simple from 'simple-mock';

import Navbar from 'shared/navbar';
import { getState } from 'utils/testUtils';
import { UnconnectedAppContainer as AppContainer, selector } from './AppContainer';

describe('pages/AppContainer', () => {
  const content = <p className="children">Some content</p>;
  function getWrapper(props) {
    const defaults = {
      fetchAuthState: () => null,
      fetchUnits: () => null,
      isAuthFetched: true,
    };
    return shallow(<AppContainer {...defaults} {...props}>{content}</AppContainer>);
  }

  describe('render', () => {
    describe('Navbar', () => {
      it('is rendered', () => {
        const title = getWrapper().find(Navbar);
        expect(title.length).to.equal(1);
      });
    });

    describe('DocumentTitle', () => {
      it('is rendered', () => {
        const title = getWrapper().find(DocumentTitle);
        expect(title.length).to.equal(1);
      });

      it('gets correct title prop', () => {
        const title = getWrapper().find(DocumentTitle);
        expect(title.prop('title')).to.equal('Huonevarausjärjestelmä');
      });
    });

    it('renders a div with className "app"', () => {
      const div = getWrapper().find('.app');
      expect(div.length).to.equal(1);
    });

    it('renders children inside a grid wrapper', () => {
      const grid = getWrapper().find(Grid);
      expect(grid).to.have.length(1);
      const children = grid.find('.children');
      expect(children.equals(content)).to.be.true;
    });

    describe('loader', () => {
      it('gets loaded if isAuthFetched is true', () => {
        const loader = getWrapper({ isAuthFetched: true }).find(Loader);
        expect(loader.prop('loaded')).to.be.true;
      });

      it('does not get loaded if isAuthFetched is false', () => {
        const loader = getWrapper({ isAuthFetched: false }).find(Loader);
        expect(loader.prop('loaded')).to.be.false;
      });
    });
  });

  describe('componentDidMount', () => {
    it('fetches auth state', () => {
      const fetchAuthState = simple.mock();
      const instance = getWrapper({ fetchAuthState }).instance();
      instance.componentDidMount();
      expect(fetchAuthState.callCount).to.equal(1);
    });

    it('fetches units', () => {
      const fetchUnits = simple.mock();
      const instance = getWrapper({ fetchUnits }).instance();
      instance.componentDidMount();
      expect(fetchUnits.callCount).to.equal(1);
    });
  });

  describe('selector', () => {
    it('returns isFetched from auth state', () => {
      const state = getState({
        auth: { isFetched: true },
      });
      expect(selector(state).isAuthFetched).to.be.true;
    });
  });
});
