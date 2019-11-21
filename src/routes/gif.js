const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const gifController = require('../controllers/gif');

const router = Router();

router.post('/gifs', authMiddleware, gifController.createGIF);
router.delete('/gifs/:gifId', authMiddleware, gifController.deleteGIF);
router.post('/gifs/:gifId/comment', authMiddleware, gifController.addGIFComment);
router.get('/gifs/:gifId', authMiddleware, gifController.viewGIF);
router.get('/gifs', authMiddleware, gifController.viewGIFs);

module.exports = router;
