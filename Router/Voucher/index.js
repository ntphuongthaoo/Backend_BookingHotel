const express = require("express");
const router = express.Router();
const voucherController = require("../../Controllers/Voucher/Voucher.Controller");
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

router.post("/createVoucher", voucherController.createVoucher);
router.get("/getAllVouchers", voucherController.getAllVouchers);
router.get("/getVoucherById/:id", voucherController.getVoucherById);
router.put("/updateVoucher/:id", voucherController.updateVoucher);
router.delete("/deleteVoucher/:id", voucherController.deleteVoucher);
router.get("/latest", voucherController.getLatestVouchers);
router.get("/getByHotel/:hotelId", voucherController.getVouchersByHotelId);

router.post("/apply", voucherController.applyVoucher);


module.exports = router;