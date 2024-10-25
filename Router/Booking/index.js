const express = require("express");
const router = express.Router();
const BOOKING_CONTROLLER = require('../../Controllers/Booking/Booking.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

router.post('/bookRoomNow', verifyToken, BOOKING_CONTROLLER.bookRoomNow);
router.post('/bookRoomNows', verifyToken, BOOKING_CONTROLLER.bookRoomNows);
router.post('/bookFromCart', verifyToken, BOOKING_CONTROLLER.bookFromCart);
router.get('/getBookingHistory', verifyToken, BOOKING_CONTROLLER.getBookingHistory);
router.get('/getAllBookings', verifyToken, BOOKING_CONTROLLER.getAllBookings);
router.put('/cancelBooking/:bookingId', verifyToken, BOOKING_CONTROLLER.cancelBooking);
router.put('/updateBookingStatus', verifyToken, BOOKING_CONTROLLER.updateBookingStatus);
router.get('/getMonthlyRevenue', verifyToken, BOOKING_CONTROLLER.getMonthlyRevenue);
// router.post('/setUserBookingDates', verifyToken, BOOKING_CONTROLLER.setUserBookingDates);

module.exports = router;