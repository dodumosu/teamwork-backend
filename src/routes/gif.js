const { Router } = require('express');
const gifController = require('../controllers/gif');

const router = Router();

router.post('/gifs', gifController.createGIF);
router.delete('/gifs/:gifId', gifController.deleteGIF);
router.post('/gifs/:gifId/comment', gifController.addGIFComment);
router.get('/gifs/:gifId', gifController.viewGIF);
router.get('/gifs', gifController.viewGIFs);

module.exports = router;
