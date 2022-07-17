const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./user.service');
const usershortid  = require("shortid");


// routes
router.post('/logintoEmail', authenticateSchema, authenticate);
router.post('/logintoMobile', authenticateSchemamobile, authenticatemobile);
router.post('/register', registerSchema, register);
router.get('/getAll', authorize(), getAll);
router.get('/search', authorize(), getAlls);
router.get('/current', authorize(), getCurrent);
router.get('/userDeatils', authorize(), getByUser);
router.get('/:id', authorize(), getById);
router.put('/resetPassword', authorize(),resetPassword);
router.put('/userupdate', authorize(), updateSchema, userupdate);
router.delete('/deleteuser', authorize(), user_delete);
router.post('/forgotpassword', forgotPassword);
router.post('/sentOtptoemail', sentOtptoemail);
router.post('/resentOtptoemail', resentOtptoemail);
router.post('/validateOtp', validateOtp);
router.post('/updateUserDetails', updateUserDetails);

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

function authenticateSchemamobile(req, res, next) {
    const schema = Joi.object({
        mobileNo: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticatemobile(req, res, next) {
    userService.authenticatetoMobile(req.body)
        .then(user => res.json(user))
        .catch(next);
}




//...Registration 
function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string().min(6).required(),
        mobileNo: Joi.string().required(),
        gender: Joi.string().required(),
        Dob: Joi.string().required(),
        departmentName: Joi.string().required(),
        Address: Joi.string().required(),
        profileImg: Joi.string().required(),
        
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
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
        userService.getAlls(req.body.search)
            .then(user => res.json(user))
            .catch(next);
}

//...get current UserInformation
function getCurrent(req, res, next) {
    res.json(req.user);
}

//...get by id UserInformation
function getById(req, res, next) {
   
    const id = req.params.userid;
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function getByUser(req, res, next) {
    const id = req.params.userid;
    userService.getByUserID(req.body.userID)
        .then(user => res.json(user))
        .catch(next);
}


//..get userDeatils UserID


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
        userID: Joi.string().empty(''),
       
    });
    validateRequest(req, next, schema);
}
//..userUpdate
function userupdate(req, res, next) {
    userService.userupdateID(req.body.userID, req.body)
        .then(user => res.json(user))
        .catch(next);
}
//..update BankDetails 

function updateUserDetails(req, res, next) {
    userService.updateuserBank(req.body.userID, req.body)
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
function user_delete(req, res, next) {
    userService.user_delete(req.body.userID)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}

//...Delete user
function forgotPassword(req, res, next) {

    userService.forgotpassword(req.body)
        .then(() => res.json({ message: 'send link email successfully' }))
        .catch(next);
}

function sentOtptoemail(req, res, next) {

    userService.forgotpassword(req.body)
        .then(() => res.json({ message: 'send link email successfully' }))
        .catch(next);
}

function resentOtptoemail(req, res, next) {

    userService.forgotpassword(req.body)
        .then(() => res.json({ message: 'send link email successfully' }))
        .catch(next);
}

function validateOtp(req, res, next) {

    userService.validOtp(req.body)
        .then(() => res.json({ message: 'Otp successful'}))
        .catch(next);
}