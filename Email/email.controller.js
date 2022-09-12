const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./email.service');
const usershortid  = require("shortid");
const {successResponse} = require('../_middleware/error-handler')
// routes
// router.post('/login', authenticateSchema, authenticate);

router.post('/adduserDeails',authorize(), addUserDetails);
router.get('/getAllEmails',authorize(), getEmails);
router.get('/searchEmailID',authorize(), searchEmails);

module.exports = router;
//...loginwith email id 
//adduserDeails
function addUserDetails(req, res, next) {
    userService.create()
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}



//...Getall Users
function getEmails(req, res, next) {
    userService.getAll()
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}



function searchEmails(req, res, next) {
    userService.getAll()
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}