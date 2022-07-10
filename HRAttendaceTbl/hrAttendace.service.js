const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./hrAttendace.service');

module.exports = {
    authenticate,
    getAll,
    getAlls,
    getById,
    getByUserID,
    create,
    resetPassword,
    update,
    delete: _delete,
    
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
async function getAll() {
    return await db.User.findAll();
}
//...search with UserInformation
async function getAlls(firstName) {
    let data = [];
    const user = await db.User.findAll({
            where: Sequelize.where(Sequelize.fn("concat", Sequelize.col("firstName"), Sequelize.col("lastName")), {
                [Op.like]: '%' + firstName + '%',

            })
          });
   if (user.length === 0){
    data = {
        "error":'Search Items Notfound',
        status : 0
     }
   }else {
    data = {
        "data":user,
        status : 0
     }
   }
    return await data
}
//...userInfo by UserID
async function getById(id) {
    return await getUser(id);
}

async function getByUserID(userID) {
    return await getUserID(userID);
}
//...create user
async function create(params) {
    // validate
  
    // save user
    await db.User.create(params);
}
//...update userInfo
async function update(id, params) {
    const user = await getUser(id);

    // validate
    const emailChanged = params.email && user.email !== params.email;
    if (emailChanged && await db.User.findOne({ where: { email: params.email } })) {
        throw 'email "' + params.email + '" is already taken';
    }
   
    const mobileNoChanged = params.mobileNo && user.mobileNo !== params.mobileNo;
    if (mobileNoChanged && await db.User.findOne({ where: { mobileNo: params.mobileNo } })) {
        throw 'mobileNo "' + params.mobileNo + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

//...reset Password userInfo
async function resetPassword(userID, params) {
    const user = await getUserID(userID);
    // hash password if it was entered
    if (params.password) {
        console.log(params.password)
        params.hash = await bcrypt.hash(params.password, 10);
        
    }

   user.update({
        params: params.hash 
    },{ where: { userID: userID }});

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

    
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

async function getUserID(userID) {
    const user = await db.User.findOne({ where: { userID: userID } })
    // const user = await db.User.findByPk(userID);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

