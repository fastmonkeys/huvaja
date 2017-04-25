import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import { createStructuredSelector } from 'reselect';

import { fetchComments } from 'api/actions';
import Comments from './Comments';

function commentsSelector(state, props) { return state.data.comments[props.reservationId]; }

export const selector = createStructuredSelector({
  comments: commentsSelector,
});

export const actions = {
  fetchComments,
};

export class CommentsContainer extends React.Component {
  static propTypes = {
    comments: PropTypes.array,
    fetchComments: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    reservationId: PropTypes.number.isRequired,
  }
  state = { isOpen: false }

  componentWillMount() {
    this.props.fetchComments({ reservationId: this.props.reservationId });
  }

  getCommentCount() {
    if (!this.props.comments) return '-';
    return this.props.comments.length;
  }

  toggleComments = (event) => {
    event.preventDefault();
    const canToggle = this.state.isOpen || (this.props.comments && this.props.comments.length);
    if (canToggle) {
      this.setState({ isOpen: !this.state.isOpen });
    }
  }

  render() {
    return (
      <div className="comments-container">
        <a onClick={this.toggleComments} tabIndex="0">
          {this.props.name} ({this.getCommentCount()})
          {' '}
          <FontAwesome name={this.state.isOpen ? 'caret-down' : 'caret-right'} />
        </a>
        {this.state.isOpen && <Comments comments={this.props.comments} />}
      </div>
    );
  }
}

export default connect(selector, actions)(CommentsContainer);