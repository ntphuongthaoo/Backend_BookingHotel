const express = require("express");
const router = express.Router();
const CART_CONTROLLER = require('../../Controllers/Cart/Cart.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

router.post('/createCart', verifyToken, CART_CONTROLLER.createCart);
router.post('/addRoomToCart', verifyToken, CART_CONTROLLER.addRoomToCart);
router.post('/removeRoomFromCart', verifyToken, CART_CONTROLLER.removeRoomFromCart);
router.post('/updateRoomInCart', verifyToken, CART_CONTROLLER.updateRoomInCart);
router.post('/getCartByUserId', verifyToken, CART_CONTROLLER.getCartByUserId);

module.exports = router;