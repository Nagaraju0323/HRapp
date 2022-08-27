const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const {successResponse} = require('../_middleware/error-handler')

const userService = require('./hr.service');

// routes
router.post('/hrloginemail', authenticateSchema, authenticate);
router.post('/hrloginmobile', authenticateSchemaMobile, authenticatemobile);
router.post('/hrregister', registerSchema, register);
router.get('/hrdetails', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/activateHr', authorize(), updateSchemaHr, updateHr);

router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticateSchemaMobile(req, res, next) {
    const schema = Joi.object({
        mobileNo: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function authenticatemobile(req, res, next) {
    userService.authenticateMobile(req.body)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        mobileNo: Joi.string().required(),
        profileImg: Joi.string().required(),
        password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        // .then(() => res.json({ message: 'HR Registration successful' }))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        // .then(users => res.json(users))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().empty(''),
        mobileNo: Joi.string().empty(''),
        profileImg: Joi.string().required(),
        password: Joi.string().min(6).empty('')
    });
    validateRequest(req, next, schema);
}

function updateSchemaHr(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().empty(''),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}


function updateHr(req, res, next) {
    userService.updatehr(req.params.email, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'HR deleted successfully' }))
        .catch(next);
}