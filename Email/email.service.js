const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./email.service');
let data = [];
module.exports = {
    authenticate,
    getAll,
    create,
    getAllbyId,
    getbyDate,
    update,
    getUserID,
    getbyDiffDate,
    delete: _delete,
    deleteAll: _deleteAll,
    
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
    let user = db.Email.findAll()
     return await user;
}


async function getAllbyId(userID) {
    const user = await db.Leave.findAndCountAll({ where: { userID } });
    if (user.count ==0){
        data = {
            "error":'Search Items Notfound',
            status : 400
         }
    }
    if (user.count !=0){
        data = {
            count: user.count,
            data: user.rows,
            status : 0
         }
    }
    return await data
}

//...create user
async function create(params) {
  let objc = {};
  objc.senderEmail = params
  console.log(params)
    if (await db.Email.findOne({ where: { senderEmail: params } })) {
        throw 'email "' + params.senderEmail + '" is already taken';
    }

    await db.Email.create(objc);
}


async function getbyDate(userID,params) {
    let currentdate = params.startDate 
    console.log('dateformat',currentdate)
    const user = await db.Leave.findAndCountAll({ where: { userID:userID,startDate:currentdate } });
    if (user.count == 0){
        data = {
            "error":'Search Items Notfound',
            status : 400
         }
    }
    if (user.count != 0){
         data = {
            count: user.count,
            data: user.rows,
            status : 200
         }
    }
    
    return await data
    
}


async function getbyDiffDate(userID,params) {
    let startdate = params.startDate 
    let endDate = params.endDate

    const user = await db.Leave.findAll({
        where: {
            userID:userID,
            [Op.or]: [{
                startDate: {
                    [Op.between]: [startdate, endDate]
                }
            }, {
                startDate: {
                    [Op.between]: [startdate, endDate]
                }
            }]
        },
    })
    
    if (user.count == 0){
        data = {
            "error":'Search Items Notfound',
            status : 400
         }
    }
    if (user.count !=0){
         data = {
            data: user,
            status : 0
         }
    }
    return await data
    
}


//...update userInfo
async function update(userID, params) {
    let startDate = params.startDate
    const user = await getUserIDDate(userID,startDate);
    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

//get by Date


async function _delete(userID,params) {
    let startDate = params.startDate
    const user = await getUserIDDate(userID,params);
    await user.destroy();
    // const user = await getUser(id);
    // await user.destroy();
}

async function _deleteAll(userID) {
    const user = await getUserIDDelete(userID);


    for (let i = 0; i < user.count; i++) { 
        console.log('lgomessag',user.userID)
        const users = await getUserID(userID);
        await users.destroy();
        
    }
    // await user.destroy();
    // const user = await getUser(id);
    // await user.destroy();
}


// helper functions

async function getUser(id) {
    const user = await db.Leave.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

async function getUserIDDate(userID,params) {

    let currentdate = params.startDate
    console.log('lgomessag',params)
    const user = await db.Leave.findOne({ where: { userID: userID,startDate:currentdate } })
    if (!user) throw ' Not found';
    return user;
}

async function getUserIDDelete(userID) {
    // console.log('lgomessag',params)
    const user = await db.Leave.findAndCountAll({ where: { userID:userID } });
    // const user = await db.Leave.findAll({ where: { userID: userID} })
    if (!user) throw ' Not found';
    return user;
}

async function getUserID(userID) {
    console.log(userID)
    const user = await db.Leave.findOne({ where: { userID: userID } })
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

