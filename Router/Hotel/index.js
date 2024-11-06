const express = require("express");
const router = express.Router();
const HOTEL_CONTROLLER  = require('../../Controllers/Hotel/Hotel.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const upload = require('../../Config/multerConfig');

router.post('/createHotel', verifyToken, authorizeRoles('ADMIN'), upload, HOTEL_CONTROLLER.createHotel);
router.put('/updateHotel/:id',verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), upload, HOTEL_CONTROLLER.updateHotel);
router.post('/deleteHotel/:hotelId',verifyToken, authorizeRoles('ADMIN'), HOTEL_CONTROLLER.deleteHotel);
router.get('/getHotelsAndSearch',verifyToken, HOTEL_CONTROLLER.getHotelsAndSearch);
router.get('/getAllHotels', HOTEL_CONTROLLER.getAllHotels);
router.get('/getHotelById/:id', HOTEL_CONTROLLER.getHotelById);
router.get('/getServiceInHotel/:id', HOTEL_CONTROLLER.getServiceInHotel);
router.get('/getHotelsName', HOTEL_CONTROLLER.getHotelsName);
router.post('/toggleServiceGroup', HOTEL_CONTROLLER.toggleServiceGroup);
router.post('/updateAllServiceFields', HOTEL_CONTROLLER.updateAllServiceFields);
router.put('/rating/:hotelId', HOTEL_CONTROLLER.updateHotelRating);
router.get('/getTopBookedHotels', HOTEL_CONTROLLER.getTopBookedHotels);

module.exports = router;