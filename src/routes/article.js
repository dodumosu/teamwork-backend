const { Router } = require('express');
const router = Router();
const articleController = require('../controllers/article');

router.post('/articles', articleController.createArticle);
router.patch('/articles/:articleId', articleController.updateArticle);
router.delete('/articles/:articleId', articleController.deleteArticle);
router.post('/articles/:articleId/comment', articleController.addArticleComment);
router.get('/articles/:articleId', articleController.viewArticle);

module.exports = router;
