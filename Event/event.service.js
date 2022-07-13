const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./event.service');
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
//...GetAll UserInformation



async function create(params) {
  
    // save user
    await db.Event.create(params);
}
async function getAll() {
    return await db.Event.findAll();

}

async function update(id, params) {
    const user = await getUser(id);

    // validate
 
    // if (await db.Event.findOne({ where: { id: params.id } })) {
    //     throw 'Department "' + params.DepName + '" is already taken';
    // }

    

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.Event.findByPk(id);
    if (!user) throw 'Department not found';
    return user;
}

async function getById(id) {
    return await getUser(id);
}
function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

