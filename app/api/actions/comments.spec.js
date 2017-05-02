import types from '../actionTypes';
import { createApiTest } from './testUtils';
import { createComment, fetchComments } from './comments';

const mockUrl = 'https://mockbin.org/bin/377913d3-940a-49a0-8d52-ad6edd56986b';

describe('api/actions/comments', () => {
  describe('fetchComments', () => {
    const cateringId = 85559;
    const reservationId = 3819;

    createApiTest({
      name: 'fetchComments(reservationId)',
      action: fetchComments,
      args: [{ reservationId }],
      tests: {
        method: 'GET',
        endpoint: `${mockUrl}?reservation_id=${reservationId}`,
        request: {
          type: types.COMMENTS_GET_REQUEST,
        },
        success: {
          type: types.COMMENTS_GET_SUCCESS,
        },
        error: {
          type: types.COMMENTS_GET_ERROR,
        },
      },
    });

    createApiTest({
      name: 'fetchComments(cateringId)',
      action: fetchComments,
      args: [{ cateringId }],
      tests: {
        method: 'GET',
        endpoint: `${mockUrl}?catering_id=${cateringId}`,
        request: {
          type: types.COMMENTS_GET_REQUEST,
        },
        success: {
          type: types.COMMENTS_GET_SUCCESS,
        },
        error: {
          type: types.COMMENTS_GET_ERROR,
        },
      },
    });
  });

  describe('createComment', () => {
    const cateringId = 4942;
    const reservationId = 3819;
    const content = 'Commends are comments';
    const userName = 'Conrad Commentor';

    createApiTest({
      name: 'createComment(reservationId)',
      action: createComment,
      args: [{ reservationId, content, userName }],
      tests: {
        method: 'POST',
        endpoint: mockUrl,
        request: {
          type: types.COMMENTS_POST_REQUEST,
        },
        success: {
          type: types.COMMENTS_POST_SUCCESS,
        },
        error: {
          type: types.COMMENTS_POST_ERROR,
        },
      },
    });

    createApiTest({
      name: 'createComment(cateringId)',
      action: createComment,
      args: [{ cateringId, content, userName }],
      tests: {
        method: 'POST',
        endpoint: mockUrl,
        request: {
          type: types.COMMENTS_POST_REQUEST,
        },
        success: {
          type: types.COMMENTS_POST_SUCCESS,
        },
        error: {
          type: types.COMMENTS_POST_ERROR,
        },
      },
    });
  });
});
