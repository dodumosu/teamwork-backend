const { Router } = require('express');
const articleController = require('../controllers/article');
const authMiddleware = require('../middleware/auth');

const router = Router();

router.post('/articles', authMiddleware, articleController.createArticle);
router.patch('/articles/:articleId', authMiddleware, articleController.updateArticle);
router.delete('/articles/:articleId', authMiddleware, articleController.deleteArticle);
router.post('/articles/:articleId/comment', authMiddleware, articleController.addArticleComment);
router.get('/articles/:articleId', authMiddleware, articleController.viewArticle);
router.get('/articles', authMiddleware, articleController.viewArticles);

module.exports = router;
