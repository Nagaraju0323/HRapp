const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./leaveManagment.service');
const usershortid  = require("shortid");

// routes
// router.post('/login', authenticateSchema, authenticate);


router.post('/addLeaves',authorize(),registerSchema,addLeaves);
router.get('/getallLeaves', getAll);
router.get('/getbyUserLeave', getById);
router.put('/userLeaveUpdate', updateSchema, update);
router.delete('/userLeaveDelete', _delete);

module.exports = router;
//...loginwith email id 

//...Getall Users
function getEmails(req, res, next) {
    userService.getAll()
        .then(users => res.json(
            data = {
                
                data: users,
                status : 200
             }
            ))
        .catch(next);
}



function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(
            data = {
                
                data: users,
                status : 200
             }
        ))
        .catch(next);
}
function registerSchema(req, res, next) {
    const schema = Joi.object({
        userID: Joi.number().required(),
        casualLeaves: Joi.number().required(),
        sickLeaves: Joi.number().required(),
        
    });
    validateRequest(req, next, schema);
}


//..eventAdd
function addLeaves(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Leaves Add' }))
        .catch(next);
}
function getById(req, res, next) {
    userService.getById(req.body.userID)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        userID: Joi.number().required(),
        casualLeaves: Joi.number().required(),
        sickLeaves: Joi.number().required(),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.body.userID, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.body.userID)
        .then(() => res.json({ message: 'Add deleted successfully' }))
        .catch(next);
}