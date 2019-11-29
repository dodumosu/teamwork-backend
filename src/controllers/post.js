const pool = require('../database/connection');
const PostHelper = require('../database/post');
const UserHelper = require('../database/user');

const createArticle = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const currentUserId = request.body.userId;
  const title = request.body.title;
  const body = request.body.body;

  const result = await postHelper.createArticle(currentUserId, title, body);
  let data = result.rows[0];
  data['message'] = 'Article successfully posted';
  response.status(200).json({
    status: 'success',
    data: data
  });
};

const updateArticle = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const currentUserId = request.body.userId;
  const articleId = request.params.article_id;
  const title = request.body.title;
  const body = request.body.body;

  const result = await postHelper.updateArticle(currentUserId, articleId, title, body);
  if (result !== null) {
    let data = result.rows[0];
    data['message'] = 'Article successfully posted';
    response.status(200).json({
      status: 'success',
      data: data
    });
  } else
    response.status(400).json({
      status: 'error',
      error: 'Article could not be updated'
    });
};

const viewPost = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const postId = request.params.post_id;
  const postInfo = postHelper.getPost(postId);

  if (result !== null)
    response.status(200).json({
      status: 'success',
      data: postInfo
    });
  else
    response.status(404).json({
      status: 'error',
      error: 'Requested item not found'
    });
};

const viewArticles = (request, response) => {};

const createGIF = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const currentUserId = request.body.userId;
  const title = request.body.title;
  const uploadFile = request.file.filename;

  const result = await postHelper.createGIF(currentUserId, uploadFile, title);
  let data = result.rows[0];
  data['message'] = 'GIF successfully posted';
  response.status(200).json({
    status: 'success',
    data: data
  });
};

const deletePost = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const userHelper = new UserHelper(pool);
  const currentUserId = request.body.userId;
  const currentUser = await userHelper.getUser(currentUserId);
  const postId = request.body.post_id;
  const result = await postHelper.deletePost(currentUser, postId);

  if (result) {
    response.status(200).json({
      status: 'success',
      data: {
        message: 'Post deleted successfully'
      }
    });
  } else {
    response.status(400).json({
      status: 'error',
      error: 'Post could not be deleted'
    });
  }
};

const addComment = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const currentUserId = request.body.userId;
  const postId = request.params.post_id;
  const comment = request.body.comment;

  const result = await postHelper.createComment(currentUserId, postId, comment);

  response.status(200).json({
    status: 'success',
    data: {
      message: 'Comment added successfully',
      comment: result.rows[0]
    }
  });
};

const viewGIFs = (request, response) => {};
const flagPost = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const userHelper = new UserHelper(pool);
  const currentUserId = request.body.userId;
  const currentUser = await userHelper.getUser(currentUserId);
  const postId = request.body.post_id;
  let result;

  if (currentUser !== null) {
    result = await postHelper.flagPost(postId);
    if (result) {
      response.status(200).json({
        status: 'success',
        data: {
          message: 'Post flagged successfully'
        }
      });
    } else {
      response.status(400).json({
        status: 'error',
        error: 'Post could not be flagged'
      });
    }
  } else {
    response.status(403).json({
      status: 'error',
      error: 'Unauthorized access'
    });
  }
};

const flagComment = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const userHelper = new UserHelper(pool);
  const currentUserId = request.body.userId;
  const currentUser = await userHelper.getUser(currentUserId);
  const postId = request.params.post_id;
  const commentId = request.params.comment_id;
  let result;

  if (currentUser !== null) {
    result = await postHelper.flagComment(postId, commentId);
    if (result) {
      response.status(200).json({
        status: 'success',
        data: {
          message: 'Comment flagged successfully'
        }
      });
    } else {
      response.status(400).json({
        status: 'error',
        error: 'Comment could not be flagged'
      });
    }
  } else {
    response.status(403).json({
      status: 'error',
      error: 'Unauthorized access'
    });
  }
};

const deleteComment = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const userHelper = new UserHelper(pool);
  const currentUserId = request.body.userId;
  const currentUser = await userHelper.getUser(currentUserId);
  const postId = request.params.post_id;
  const commentId = request.params.comment_id;
  const result = await postHelper.deleteComment(currentUser, postId, commentId);

  if (result) {
    response.status(200).json({
      status: 'success',
      data: {
        message: 'Comment deleted successfully'
      }
    });
  } else {
    response.status(400).json({
      status: 'error',
      error: 'Comment could not be deleted'
    });
  }
};

const feed = async (request, response) => {
  const postHelper = new PostHelper(pool);
  const result = await postHelper.getPosts();
  response.status(200).json({
    status: 'success',
    data: result.rows
  });
};

module.exports = {
  createArticle,
  updateArticle,
  createGIF,
  deletePost,
  addComment,
  viewPost,
  flagPost,
  flagComment,
  deleteComment,
  feed
};
