const { Router } = require('express');
const router = Router();
const gifController = require('../controllers/gif');

router.post('/gifs', gifController.createGIF);
router.delete('/gifs/:gifId', gifController.deleteGIF);
router.post('/gifs/:gifId/comment', gifController.addGIFComment);
router.get('/gifs/:gifId', gifController.viewGIF);
router.get('/gifs', gifController.viewGIFs);

module.exports = router;
