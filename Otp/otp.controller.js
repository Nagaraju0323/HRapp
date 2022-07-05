const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./otp.service');


// routes
router.post('/sendOtpMobile', registerSchema, registerMobile);
router.post('/sendOtpEmail',registerSchema, registerEamil);
router.post('/validationOtp',validationOtp);

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
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function registerEamil(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

//validation Otp
function validationOtp(req, res, next) {
    userService.validOtp(req.body)
        .then(() => res.json({ message: 'otp successful' }))
        .catch(next);
}

