const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./leave.service');
const usershortid  = require("shortid");

// routes
// router.post('/login', authenticateSchema, authenticate);

router.post('/applyLeave',authorize(), applyLeaveModel, applyLeaves);
router.get('/getAllLeave',authorize(), getLeaves);
router.post('/compareLvm', authorize(), compareLeave);
router.get('/getLeavebyID',authorize(), getLeavesbyID);
router.get('/getLeavebydate',authorize(), getLeavesbyDate);
router.get('/getLeavebyDiff',authorize(), getLeavesDiffDate);
router.put('/updateLeave', authorize(), updateSchema, update);
router.put('/approveLeave', authorize(), approveLeave);
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
        duationDates: Joi.object().required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        userID: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function applyLeaves(req, res, next) {

    userService.create(req.body)
        .then(() => res.json({ message: 'successful Leave Applied',status:200 }))
        .catch(next);
}

//...Getall Users
function getLeaves(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getLeavesbyDate(req, res, next) {
    console.log('this is');
    userService.getbyDate(req.body.userID,req.body)
        .then(user => res.json(user))
        .catch(next);
}

function getLeavesDiffDate(req, res, next) {
    const id = req.params.userID;
    userService.getbyDiffDate(req.body.userID,req.body)
        .then(user => res.json(user))
        .catch(next);
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
        duationDates: Joi.object().required(),
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
        .then(user => res.json(user))
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

