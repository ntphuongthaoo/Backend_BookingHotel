const express = require('express');
const router = express.Router();
const REVIEW_CONTROLLER = require('../../Controllers/Review/Review.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');

router.post('/addReview', verifyToken, REVIEW_CONTROLLER.addReview);
router.get('/getReviewsByRoomId/:roomId', REVIEW_CONTROLLER.getReviewsByRoomId);
router.get('/getReviews', verifyToken, REVIEW_CONTROLLER.getReviews);
router.put('/updateReview/:reviewId', verifyToken, REVIEW_CONTROLLER.updateReview);
router.post('/getReviewByUserAndRoom', verifyToken, REVIEW_CONTROLLER.getReviewByUserAndRoom);
router.delete('/deleteReviewByUser/:reviewId', verifyToken, REVIEW_CONTROLLER.deleteReviewByUser);
router.patch('/toggleReviewStatus/:reviewId', verifyToken, REVIEW_CONTROLLER.toggleReviewStatus);

module.exports = router;