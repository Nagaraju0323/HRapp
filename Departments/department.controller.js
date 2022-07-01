const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./department.service');

// routes
// router.post('/authenticate', authenticateSchema, authenticate);
// router.post('/addDepartment', registerSchema, register);
// router.get('/allDepartments', getAll);
// router.get('/current', authorize(), getCurrent);
// router.get('/:id', authorize(), getById);
// router.put('/:id', authorize(), updateSchema, update);
// router.delete('/:id', authorize(), _delete);
router.post('/addDepartment', authenticateSchema, authenticate);
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
        // firstName: Joi.string().required(),
        // lastName: Joi.string().required(),
        DepName: Joi.string().required(),
        // password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Department Add successful' ,status:0}))
        .catch(next);
}

function getAll(req, res, next) {
  
    userService.getAll()
        .then(users => res.json({ "data": users,status:0}))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        // firstName: Joi.string().empty(''),
        // lastName: Joi.string().empty(''),
        DepName: Joi.string().empty(''),
        // password: Joi.string().min(6).empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'Department deleted successfully' }))
        .catch(next);
}