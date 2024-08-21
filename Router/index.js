const express = require('express');
const userRouter = require('./User');
const hotelRouter = require('./Hotel')
const roomRouter = require('./Room');

function route(app) {
    app.use('/users', userRouter);
    app.use('/hotels', hotelRouter);
    app.use('/rooms', roomRouter);
}

module.exports = route;
