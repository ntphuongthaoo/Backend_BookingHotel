const express = require('express');
const userRouter = require('./User');
const hotelRouter = require('./Hotel')

function route(app) {
    app.use('/users', userRouter);
    app.use('/hotels', hotelRouter);
}

module.exports = route;
