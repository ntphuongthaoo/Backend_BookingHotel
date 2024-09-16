const express = require("express");
const router = express.Router();
const HOTEL_CONTROLLER  = require('../../Controllers/Hotel/Hotel.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const upload = require('../../Config/multerConfig');

router.post('/createHotel', verifyToken, authorizeRoles('ADMIN'),upload.array('images', 10), HOTEL_CONTROLLER.createHotel);
router.put('/updateHotel/:id',verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), upload.array('images', 10), HOTEL_CONTROLLER.updateHotel);
router.post('/deleteHotel/:hotelId',verifyToken, authorizeRoles('ADMIN'), HOTEL_CONTROLLER.deleteHotel);
router.get('/getHotelsAndSearch',verifyToken, HOTEL_CONTROLLER.getHotelsAndSearch);
router.get('/getAllHotels', HOTEL_CONTROLLER.getAllHotels);
router.get('/getHotelById/:id', HOTEL_CONTROLLER.getHotelById);

module.exports = router;