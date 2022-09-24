const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const authorizehr = require('_middleware/authorizeHr')
const userService = require('./event.service');
const usershortid  = require("shortid");

// routes
// router.post('/login', authenticateSchema, authenticate);
const {successResponse} = require('../_middleware/error-handler')

router.post('/eventAdd',authorize(),registerSchema, eventAdd);
router.get('/hrallEvents',authorizehr(),gethrAll);
router.get('/allEvents',authorize(),getAll);

router.get('/:id', getById);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

module.exports = router;
//...loginwith email id 

//...Getall Users
function getEmails(req, res, next) {
    userService.getAll()
        .then(users => res.json(
            data = {
                
                data: users,
                status : 200
             }
            ))
        .catch(next);
}



function getAll(req, res, next) {
    userService.getAll()
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function gethrAll(req, res, next) {
    userService.getAll()
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        eventTitle: Joi.string().required(),
        evnetDescription: Joi.string().required(),
        evnetStartDate: Joi.string().required(),
        evnetEndDate: Joi.string().required(),
        evnetUploadImg: Joi.string().required(),
        evnetLocation: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}


//..eventAdd
function eventAdd(req, res, next) {
    userService.create(req.body)
    .then(users => successResponse(res,users,0,'success'))
        // .then(() => res.json({ message: 'EvnetAdded' }))
        .catch(next);
}
function getById(req, res, next) {
    userService.getById(req.params.id)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        eventTitle: Joi.string().required(),
        evnetDescription: Joi.string().required(),
        evnetStartDate: Joi.string().required(),
        evnetEndDate: Joi.string().required(),
        evnetUploadImg: Joi.string().required(),
        evnetLocation: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}