const { Router } = require('express');
const postController = require('../controllers/post');
const authMiddleware = require('../middleware/auth');

const router = Router();

router.post('/articles', authMiddleware, postController.createArticle);
router.patch('/articles/:articleId', authMiddleware, postController.updateArticle);
router.delete('/articles/:articleId', authMiddleware, postController.deleteArticle);
router.post('/articles/:articleId/comment', authMiddleware, postController.addArticleComment);
router.get('/articles/:articleId', authMiddleware, postController.viewArticle);
router.get('/articles', authMiddleware, postController.viewArticles);
router.post('/gifs', authMiddleware, postController.createGIF);
router.delete('/gifs/:gifId', authMiddleware, postController.deleteGIF);
router.post('/gifs/:gifId/comment', authMiddleware, postController.addGIFComment);
router.get('/gifs/:gifId', authMiddleware, postController.viewGIF);
router.get('/gifs', authMiddleware, postController.viewGIFs);
router.get('/feed', authMiddleware, postController.feed);

module.exports = router;
