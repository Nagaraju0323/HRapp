const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./department.service');
const {successResponse} = require('../_middleware/error-handler')

// routes
// router.post('/addDepartment', authenticateSchema, authenticate);
router.post('/addDepartment', registerSchema, register);
router.get('/allDepartments', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        DepName: Joi.string().required(),
        // password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}



function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        DepName: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    let data = [];
    
    // sqlResults = [
    //     {
    //         message: 'Department Add successfully',
    //         status:200
    //     }
    // ];
    userService.create(req.body)
        // .then(() => res.json({sqlResults}))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);



}

function getAll(_req, res, next) {
  
    userService.getAll()
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
        DepName: Joi.string().empty(''),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
     .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}