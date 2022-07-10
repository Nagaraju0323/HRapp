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
// router.get('/getAll', authorize(), getAll);
// router.get('/search', authorize(), getAlls);
// router.get('/current', authorize(), getCurrent);
// router.get('/:id', authorize(), getById);
// router.put('/resetPassword', authorize(),resetPassword);
// router.put('/:id', authorize(), updateSchema, update);
// router.delete('/:id', authorize(), _delete);

module.exports = router;
//...loginwith email id 
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

//...Registration 
function applyLeaveModel(req, res, next) {
    const schema = Joi.object({

        senderEmail: Joi.string().required(),
        sendTo: Joi.object().required(),
        leveType: Joi.number().required(),
        titleType: Joi.string().min(5).required(),
        descriptionType: Joi.string().min(5).required(),
        duationDates: Joi.object().required(),
        statDate: Joi.date().required(),
        endDate: Joi.date().required(),
        userID: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function applyLeaves(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

//...Getall Users
function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}
//...search By Users
function getAlls(req, res, next) {
        const id = req.params.userid;
        userService.getAlls(req.body.firstName)
            .then(user => res.json(user))
            .catch(next);
}

//...get current UserInformation
function getCurrent(req, res, next) {
    res.json(req.user);
}

//...get by id UserInformation
function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

//...update UserInformation
function updateSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().empty('').email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','in'] } }),
        password: Joi.string().min(6).empty(''),
        mobileNo: Joi.string().empty(''),
        gender: Joi.string().empty(''),
        Dob: Joi.string().empty(''),
        departmentName: Joi.string().empty(''),
        Address: Joi.string().empty(''),
        profileImg: Joi.string().empty(''),
       
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}

//...Reset Password
function resetPassword(req, res, next) {
    console.log('this is claling')
    const id = req.params.userID;
    userService.resetPassword(req.body.userID, req.body)
        .then(user => res.json(user))
        .catch(next);
}

//...Delete user
function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}

