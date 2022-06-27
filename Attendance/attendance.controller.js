const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./attendance.service');

// routes
// router.post('/authenticate', authenticateSchema, authenticate);
router.post('/empAttendance',  authorize(),registerSchema, register);
router.get('/getAllAttendance', authorize(), getAll);
router.get('/getAllbyId', authorize(), getAllAtd);
router.get('/currentAttendance', authorize(), getCurrent);
router.get('/:userid', authorize(), getById);
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

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        presentDay: Joi.string().required(),
        absentDay: Joi.string().required(),
        userid: Joi.number().required(),
       
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful',status:0}))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json({ "data": users,status:0}))
        .catch(next);
}

function getAllAtd(req, res, next) {
    const id = req.params.userid;
    userService.getAllbyId(req.body.userid)
        .then(user => res.json(user))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    const id = req.params.userid;
    userService.getById(req.params.userid)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        presentDay: Joi.string().empty(''),
        absentDay: Joi.string().empty(''),
        userid: Joi.number().empty('')
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
        .then(() => res.json({ message: 'Attendce deleted successfully' }))
        .catch(next);
}