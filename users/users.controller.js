const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./user.service');

// routes
router.post('/login', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.get('/getAll', authorize(), getAll);
router.get('/search', authorize(), getAlls);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);



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

//...mobileNumber email id 



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
        profileImg: Joi.string().required()
        
        
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getAlls(req, res, next) {
    // userService.getAlls()
    //     .then(users => res.json(users))
    //     .catch(next);

        const id = req.params.userid;
        userService.getAlls(req.body.firstName)
            .then(user => res.json(user))
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
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().empty('').email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','in'] } }),
        password: Joi.string().min(6).empty(''),
        mobileNo: Joi.string().empty(''),
        gender: Joi.string().empty(''),
        Dob: Joi.string().empty(''),
        departmentName: Joi.string().empty(''),
        Address: Joi.string().empty(''),
        profileImg: Joi.string().empty('')
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
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}

