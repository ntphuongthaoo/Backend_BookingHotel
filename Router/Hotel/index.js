const express = require("express");
const router = express.Router();
const HOTEL_CONTROLLER  = require('../../Controllers/Hotel/Hotel.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

router.post('/createHotel', HOTEL_CONTROLLER.createHotel);
router.put('/updateHotel/:id',verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), HOTEL_CONTROLLER.updateHotel);
router.post('/deleteHotel/:hotelId',verifyToken, authorizeRoles('ADMIN'), HOTEL_CONTROLLER.deleteHotel);
router.get('/getHotelsAndSearch',verifyToken, authorizeRoles('ADMIN'), HOTEL_CONTROLLER.getHotelsAndSearch);

module.exports = router;