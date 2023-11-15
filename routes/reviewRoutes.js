const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authCotroller = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authCotroller.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authCotroller.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authCotroller.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authCotroller.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
