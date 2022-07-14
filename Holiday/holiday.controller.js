const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./holiday.service');
const usershortid  = require("shortid");

// routes
// router.post('/login', authenticateSchema, authenticate);


router.post('/addHoliday',authorize(),registerSchema, addHoliday);
router.get('/getallHolidays', getAll);
router.get('/:id', getById);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

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
        holidayTitle: Joi.string().required(),
        holidayDate: Joi.string().required(),
        
    });
    validateRequest(req, next, schema);
}


//..eventAdd
function addHoliday(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Holiday Add' }))
        .catch(next);
}
function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        holidayTitle: Joi.string().required(),
        holidayDate: Joi.string().required(),
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
        .then(() => res.json({ message: 'Add deleted successfully' }))
        .catch(next);
}