const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./attendance.service');

// routes
// router.post('/authenticate', authenticateSchema, authenticate);
router.post('/empAttendanceIn',  authorize(),registerSchema, employeeInTime);
router.post('/empAttendanceOut',  authorize(),registerSchemaOut, employeeOutTime);
//..leaveapply 
// router.post('/empApplyLeave',  authorize(),registerapplyLeave, employeeApplyLeave);
router.get('/getAllAttendance', authorize(), getAll);
router.get('/getAllbyId', authorize(), getAllAtd);
router.get('/getCurrentDate', authorize(), getAllAtd);
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
        userID: Joi.number().required(),
       
    });
    validateRequest(req, next, schema);
}
//..Apply Leave
function registerapplyLeave(req, res, next) {
    const schema = Joi.object({
        presentDay: Joi.string().required(),
        userID: Joi.number().required(),
       
    });
    validateRequest(req, next, schema);
}


function registerSchemaOut(req, res, next) {
    const schema = Joi.object({
        presentDay: Joi.string().required(),
        userID: Joi.number().required(),
       
    });
    validateRequest(req, next, schema);
}


//..employee Intime 
function employeeInTime(req, res, next) {
    userService.inTime(req.body)
        .then(() => res.json({ message: 'successful In',status:0}))
        .catch(next);
}
//..employee Intime 
function employeeOutTime(req, res, next) {
    userService.OutTime(req.body)
        .then(() => res.json({ message: 'successfully out',status:0}))
        .catch(next);
}

//..get by userID

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json({ "data": users,status:0}))
        .catch(next);
}

function getAllAtd(req, res, next) {
    const id = req.params.userID;
    userService.getAllbyId(req.body.userID)
        .then(user => res.json(user))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    const id = req.params.userID;
    userService.getById(req.params.userID)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        presentDay: Joi.string().empty(''),
        absentDay: Joi.string().empty(''),
        userID: Joi.number().empty('')
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