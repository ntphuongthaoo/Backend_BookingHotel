const express = require("express");
const router = express.Router();
const HOTEL_CONTROLLER  = require('../../Controllers/Hotel/Hotel.Controller');

router.post('/createHotel', HOTEL_CONTROLLER.createHotel);
router.put('/updateHotel/:id', HOTEL_CONTROLLER.updateHotel);
module.exports = router;