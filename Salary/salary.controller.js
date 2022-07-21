const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./salary.service');
const usershortid  = require("shortid");

// routes
// router.post('/login', authenticateSchema, authenticate);


router.post('/addCTC',authorize(),registerSchema,addCTC);
router.get('/getallsalary',authorize(), getAll);
router.get('/getbysalary',authorize(), getById);
router.put('/salaryeUpdate',authorize(), updateSchema, update);
router.delete('/salaryeDelete',authorize(), _delete);

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
        basicPay: Joi.number().required(),
        hra:Joi.number().required(),
        specialAllowance : Joi.number().required(),
        Conveyance: Joi.number().required(),
        travelAllowance: Joi.number().required(),
        Esi: Joi.number().required(),
        employeerPF: Joi.number().required(),
        employeePF: Joi.number().required(),
        ctc: Joi.number().required(),
        
    });
    validateRequest(req, next, schema);
}


//..eventAdd
function addCTC(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Employee Salary Addedd' }))
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
        basicPay: Joi.number().required(),
        hra:Joi.number().required(),
        specialAllowance : Joi.number().required(),
        Conveyance: Joi.number().required(),
        travelAllowance: Joi.number().required(),
        Esi: Joi.number().required(),
        employeerPF: Joi.number().required(),
        employeePF: Joi.number().required(),
        ctc: Joi.number().required(),
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