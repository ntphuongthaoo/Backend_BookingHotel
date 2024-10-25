const express = require('express');
const router = express.Router();
const REVIEW_CONTROLLER = require('../../Controllers/Review/Review.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');

router.post('/addReview', verifyToken, REVIEW_CONTROLLER.addReview);
router.get('/getReviewsByRoomId/:roomId', REVIEW_CONTROLLER.getReviewsByRoomId);
router.put('/updateReview/:reviewId', verifyToken, REVIEW_CONTROLLER.updateReview);
router.post('/getReviewByUserAndRoom', verifyToken, REVIEW_CONTROLLER.getReviewByUserAndRoom);


module.exports = router;