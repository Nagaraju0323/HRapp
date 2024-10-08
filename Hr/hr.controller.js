const express = require('express');
const { required } = require('joi');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorizehr = require('_middleware/authorizeHr')

const {successResponse} = require('../_middleware/error-handler')
const userService = require('./hr.service');

// routes
router.post('/hrDetailsExisted', authenticateuserDeatils, userDetailsExisted);
router.post('/hrloginemail', authenticateSchema, authenticate);
router.post('/hrloginmobile', authenticateSchemaMobile, authenticatemobile);
router.post('/hrregister', registerSchema, register);
router.get('/hrdetails', authorizehr(), getAll);
router.get('/current', authorizehr(), getCurrent);
router.get('/:id', authorizehr(), getById);
router.put('/activateHr', authorizehr(), updateSchemaHr, updateHr);
router.put('/hrProfileUpdate', authorizehr(), updateSchema_hr, hrProfileUpdate);
router.put('/:id', authorizehr(), updateSchema, update);
router.put('/hrresetPassword', authorizehr(),hrresetPassword);
router.delete('/:id', authorizehr(), _delete);
router.post('/hrsentOtpemailPWD', sentOtptemailPWD);
router.post('/hrsentOtpmobilePWD', sentOtpmobilePWD);
router.post('/hrchangePWDemail', changePWDemail);
router.post('/hrchangePWDmobile', changePWDmobile);


module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticateSchemaMobile(req, res, next) {
    const schema = Joi.object({
        mobileNo: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticateuserDeatils(req, res, next) {
    const schema = Joi.object({
        mobileNo: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function userDetailsExisted(req,res,next){
        userService.userDeatilsExisted(req.body)
            .then(users => successResponse(res,users,0,'success'))
            .catch(next);
    

}

function hrresetPassword(req, res, next) {
    const id = req.params.userID;
    userService.resetPassword(req.body)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function authenticatemobile(req, res, next) {
    userService.authenticateMobile(req.body)
        // .then(user => res.json(user))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        mobileNo: Joi.string().required(),
        profileImg: Joi.string().required(),
        password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        // .then(() => res.json({ message: 'HR Registration successful' }))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        // .then(users => res.json(users))
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
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().empty(''),
        mobileNo: Joi.string().empty(''),
        profileImg: Joi.string().required(),
        password: Joi.string().min(6).empty('')
    });
    validateRequest(req, next, schema);
}
function updateSchema_hr(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().empty(''),
        mobileNo: Joi.string().empty(''),
        profileImg: Joi.string().required(),
        userID: Joi.string().required(),
       
    });
    validateRequest(req, next, schema);
}


function updateSchemaHr(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().empty(''),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}


function updateHr(req, res, next) {
    userService.updatehr(req.params.email, req.body)
        .then(user => res.json(user))
        .catch(next);
}
//hrDetailsUpdate 

function hrProfileUpdate(req, res, next) {
    userService.hrDeatailsUpdate(req.body)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'HR deleted successfully' }))
        .catch(next);
}

function sentOtptemailPWD(req, res, next) {

    userService.sendOTPforgot(req.body)
        // .then(() => res.json({ message: 'send link email successfully' }))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}


function sentOtpmobilePWD(req, res, next) {
console.log(req.body)
    userService.sendOTPforgotMobile(req.body)
        // .then(() => res.json({ message: 'send link mobile successfully' }))
        .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

function changePWDemail(req, res, next) {
    console.log('this is claling')
    const id = req.params.userID;
    userService.changePWDemail(req.body)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}

//change PWD mobile 
function changePWDmobile(req, res, next) {
    console.log('this is claling')
    const id = req.params.userID;
    userService.changePWDmobile(req.body)
    .then(users => successResponse(res,users,0,'success'))
        .catch(next);
}
