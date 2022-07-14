const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./leaveManagment.service');
let data = [];
module.exports = {
    
    create,
    getAll,
    getById,
    update,
    delete: _delete
    
};

//...user Login
async function authenticate({ email, password }) {
  
    const user = await db.User.scope('withHash').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'email or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function create(params) {
    // save user
    await db.LeaveManagment.create(params);
}
async function getAll() {
    return await db.LeaveManagment.findAll();
}

async function update(userID, params) {
    const user = await getUser(userID);

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(userID) {
    const user = await getUser(userID);
    await user.destroy();
}

// helper functions

async function getUser(userID) {
    const user = await db.LeaveManagment.findOne({ where: { userID: userID } })
    if (!user) throw 'not found';
    return user;
}

async function getById(userID) {
    return await getUser(userID);
}
function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

