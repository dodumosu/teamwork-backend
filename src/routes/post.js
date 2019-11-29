const { Router } = require('express');
const postController = require('../controllers/post');
const authMiddleware = require('../middleware/auth');

const router = Router();

router.post('/articles', authMiddleware, postController.createArticle);
router.patch('/articles/:post_id', authMiddleware, postController.updateArticle);
router.delete('/articles/:post_id', authMiddleware, postController.deletePost);
router.post('/articles/:post_id/comment', authMiddleware, postController.addComment);
router.post('/articles/:post_id/comment/:comment_id', authMiddleware, postController.flagComment);
router.get('/articles/:post_id', authMiddleware, postController.viewPost);
router.post('/gifs', authMiddleware, postController.createGIF);
router.delete('/gifs/:post_id', authMiddleware, postController.deletePost);
router.post('/gifs/:post_id/comment', authMiddleware, postController.addComment);
router.post('/gifs/:post_id/comment/:comment_id', authMiddleware, postController.flagComment);
router.get('/gifs/:post_id', authMiddleware, postController.viewPost);
router.get('/feed', authMiddleware, postController.feed);

module.exports = router;
