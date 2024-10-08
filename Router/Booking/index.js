const express = require("express");
const router = express.Router();
const BOOKING_CONTROLLER = require('../../Controllers/Booking/Booking.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

router.post('/bookRoomNow', verifyToken, BOOKING_CONTROLLER.bookRoomNow);
router.post('/bookRoomNows', verifyToken, BOOKING_CONTROLLER.bookRoomNows);
router.post('/bookFromCart', verifyToken, BOOKING_CONTROLLER.bookFromCart);
router.post('/getBookingsByUserId', verifyToken, BOOKING_CONTROLLER.getBookingsByUserId);
// router.post('/setUserBookingDates', verifyToken, BOOKING_CONTROLLER.setUserBookingDates);

module.exports = router;