const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./email.service');
const usershortid  = require("shortid");

// routes
// router.post('/login', authenticateSchema, authenticate);


router.get('/getAllEmails',authorize(), getEmails);
router.get('/searchEmailID',authorize(), searchEmails);

module.exports = router;
//...loginwith email id 

//...Getall Users
function getEmails(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}



function searchEmails(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}