const express = require('express');
const userRouter = require('./User');
const hotelRouter = require('./Hotel')
const roomRouter = require('./Room');
const cartRouter = require('./Cart');
const bookingRouter = require('./Booking');
const paymentRouter = require('./PaymentVNPay');
const reviewRouter = require('./Review');
const messageRouter = require('./Message');
const voucherRouter = require('./Voucher');

function route(app) {
    app.use('/users', userRouter);
    app.use('/hotels', hotelRouter);
    app.use('/rooms', roomRouter);
    app.use('/carts', cartRouter);
    app.use('/bookings', bookingRouter);
    app.use('/payments', paymentRouter);
    app.use('/reviews', reviewRouter);
    app.use('/messages', messageRouter);
    app.use('/vouchers', voucherRouter);
}

module.exports = route;
