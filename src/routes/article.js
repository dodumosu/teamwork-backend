const { Router } = require('express');
const articleController = require('../controllers/article');

const router = Router();

router.post('/articles', articleController.createArticle);
router.patch('/articles/:articleId', articleController.updateArticle);
router.delete('/articles/:articleId', articleController.deleteArticle);
router.post('/articles/:articleId/comment', articleController.addArticleComment);
router.get('/articles/:articleId', articleController.viewArticle);

module.exports = router;
