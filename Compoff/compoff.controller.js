const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./compoff.service');

// routes
// router.post('/addDepartment', authenticateSchema, authenticate);
router.post('/applycompoff',authorize(), compoffModel, applyCompOff);
router.post('/takeCompoff',authorize(), takeCompoff);
router.get('/getAllCompoff', authorize(),getAllCompoff);
router.get('/getCompoffID', getCompoffID);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

module.exports = router;

function compoffModel(req, res, next) {
    const schema = Joi.object({
        userID: Joi.number().required(),
        resonOf: Joi.string().required(),
        applydate: Joi.string().required(),

    });
    validateRequest(req, next, schema);
}

function applyCompOff(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'CompOff Add successful' ,status:0}))
        .catch(next);
}

function getAllCompoff(req, res, next) {
  
    userService.getAll()
        .then(users => res.json({ "data": users,status:0}))
        .catch(next);
}

function getCompoffID(req, res, next) {
    userService.getCompoofID(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function takeCompoff(req, res, next) {
    userService.takecompoff(req.body)
        .then(() => res.json({ message: 'taken Compoff successful' ,status:0}))
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
        DepName: Joi.string().empty(''),
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