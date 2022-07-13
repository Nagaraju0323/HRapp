const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./otp.service');


// routes

router.post('/sendOtpMobile', registerMobile);
router.post('/sendOtpEmail', registerEamil);
router.post('/validateOtp',validationOtp);
router.post('/resentOtp',resentOtptoemail);

module.exports = router;
//...loginwith email id 

//...Registration 
function registerSchema(req, res, next) {
    const schema = Joi.object({
        // email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        email: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function registerMobile(req, res, next) {
    userService.sendOtpMobile(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function registerEamil(_req, res, next) {
    userService.sendOtpToEmail(_req.body)
        .then((message) => res.json({ message: message }))
        .catch(next);
}
//resent Otp
function resentOtptoemail(_req, res, next) {
    userService.resendOtpToEmail(_req.body)
        .then((message) => res.json({ message: message }))
        .catch(next);
}

//validation Otp
function validationOtp(req, res, next) {
    userService.validOtp(req.body)
        .then(() => res.json({ message: 'otp successful' }))
        .catch(next);
}

