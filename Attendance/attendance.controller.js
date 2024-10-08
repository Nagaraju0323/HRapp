const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const authorizehr = require('_middleware/authorizeHr')

const userService = require('./attendance.service');
const {successResponse} = require('../_middleware/error-handler')

// routes

router.post('/empAttendanceIn', authorize(),registerSchemaIn, employeeInTime);
router.post('/empAttendanceOut',  authorize(),registerSchemaOut, employeeOutTime);
router.post('/absent',authorize(), employeeabsent);
//..leaveapply 
router.get('/getAllAttendance', authorize(), getAll);
router.get('/getAllbyId', authorize(), getAllAtd);
router.get('/getCurrentDate', authorize(), getbyCurrentDate);
router.get('/hrgetAllAttendance', authorizehr(), getAllDate);

//get byt attandnace by Date 

router.get('/getAll',authorize(), getAllDate);
router.get('/getInStatus', authorize(), getInStatus);
router.get('/getDiffDate', authorize(), getbyDifftDate);
router.get('/:userid', authorize(), getById);
router.put('/updateAttendance', authorize(), updateSchema, update);
router.put('/:id', authorize(), updateSchema, attendanceupdate);
router.delete('/:id', authorize(), _delete);
router.post('/calculateAttd', authorize(), calculateAttd);

let data = [];

module.exports = router;


function registerSchemaIn(req, res, next) {
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
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}
//..employee Intime 
function employeeOutTime(req, res, next) {
    userService.OutTime(req.body)
        // .then(() => res.json({ message: 'successfully out',status:0}))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function employeeabsent(req, res, next) {
    userService.empabsent(req.body)
        // .then(() => res.json({ message: 'Employee Is absent',status:0}))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

//..get by userID

function getAll(req, res, next) {
    userService.getAll()
        // .then(users => res.json({ "data": users,status:0}))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function getAllAtd(req, res, next) {
    userService.getAllbyId(req.query.userID)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function getbyCurrentDate(req, res, next) {
    console.log("---------",req.query.date)
    userService.getbyDate(req.query)
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

//get All Attenance By DAte 

function getAllDate(req, res, next) {
    console.log("---------",req.query.date)
 
    userService.getAllDate(req.query)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}


function getInStatus(req, res, next) {
    userService.getbyDate(req.query)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function getbyDifftDate(req, res, next) {
    const id = req.params.userID;
    userService.getbyDiffDate(req.body.userID,req.body)
        .then(user => res.json(user))
        .catch(next);
}


function getById(req, res, next) {
    const id = req.params.userID;
    userService.getById(req.params.userID)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
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

//..updateAttendance

function attendanceupdate(req, res, next) {
    userService.update(req.params.id, req.body)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
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



function calculateAttd(req, res, next) {
    userService.caluclateAtd(req.body)
        .then(user => res.json(user))
        .catch(next);
}