const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./leave.service');
const usershortid  = require("shortid");
const authorizehrs = require('_middleware/authorizeHr')

const {successResponse} = require('../_middleware/error-handler')
// const {successResponse} = require('../_middleware/error-handler')
// routes
// router.post('/login', authenticateSchema, authenticate);

router.post('/applyLeave',authorize(), applyLeaveModel, applyLeaves);
router.get('/getAllLeave',authorize(), getLeaves);
router.get('/getAllLeaveType',authorize(), getLeavesTypes);
router.post('/compareLvm', authorize(), compareLeave);
router.get('/getLeavebyID',authorize(), getLeavesbyID);
router.get('/getLeavedate',authorize(),getleavedate);
router.get('/getLeavebydate',authorize(), getLeavesbyDate);
router.get('/hrgetLeavebydate',authorizehrs(), getLeavesbyDate);
router.get('/getLeavebyDiff',authorizehrs(), hrgetLeavesDiffDate);
router.get('/getLeavebyDiff',authorize(), getLeavesDiffDate);

router.put('/updateLeave', authorize(), updateSchema, update);
router.put('/approveLeave', authorizehrs(), approveLeave);
router.delete('/deleteLeave', authorize(), _delete);
router.delete('/deleteAll', authorize(), deleteAll);

module.exports = router;
//...loginwith email id 

//...Registration 
function applyLeaveModel(req, res, next) {
    const schema = Joi.object({
        senderEmail: Joi.string().required(),
        sendTo: Joi.object().required(),
        leaveType: Joi.number().required(),
        titleType: Joi.string().min(5).required(),
        descriptionType: Joi.string().min(5).required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        userID: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function applyLeaves(req, res, next) {

    userService.create(req.body)
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

//...Getall Users
function getLeaves(req, res, next) {
    userService.getAll()
        // .then(users => res.json(users))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}
//getLeavesTypes
function getLeavesTypes(req, res, next) {
    userService.getAllLeaveType(req.query.userID,req.query.leaveType)
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function getLeavesbyDate(req, res, next) {
    // console.log('this is');
   
    // console.log('messageinfo',req.query.startDate)
    userService.getbyDate(req.query.startDate)
    // userService.getbyDate(req.body.userID,req.body)
    
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}
function getleavedate(req, res, next) {
    userService.getbyDate(req.query.startDate,req.query.userID)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}


function hrgetLeavesDiffDate(req, res, next) {
    const id = req.params.userID;
    userService.getbyDiffDate(req.query.startDate)
        .then(users => successResponse(res,users,0,'success'))
        .catch(next => filure);
}


function getLeavesDiffDate(req, res, next) {
    const id = req.params.userID;
    userService.getbyDiffDate(req.query.startDate)
        .then(users => successResponse(res,users,0,'success'))
        .catch(next => filure);
}


function getLeavesbyID(req, res, next) {
    userService.getAllbyId(req.body.userID)
        .then(user => res.json(user))
        .catch(next);
}
//..day by date 



//...get by id UserInformation
function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

//...update UserInformation
function updateSchema(req, res, next) {
    const schema = Joi.object({
        senderEmail: Joi.string().required(),
        sendTo: Joi.object().required(),
        leaveType: Joi.number().required(),
        titleType: Joi.string().min(5).required(),
        descriptionType: Joi.string().min(5).required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        userID: Joi.string().required(),
       
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.body.userID, req.body)
        .then(user => res.json(user))
        .catch(next);
}

//..aproved Leave

function approveLeave(req, res, next) {
    userService.approvedLeave(req.body.userID, req.body)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}


//...Delete user
function _delete(req, res, next) {
    userService.delete(req.body.userID,req.body)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}

function deleteAll(req, res, next) {
    userService.deleteAll(req.body.userID)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}


function compareLeave(req, res, next) {
    userService.compareLeavemanagement(req.body)
   
        .then(data => res.json({data}))
        .catch(next);
}

