const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var dateTime = require('node-datetime');
const { text } = require('body-parser');
var moment = require('moment');
const { param } = require('./attendance.controller');
const date_ob = new Date();

module.exports = {
    authenticate,
    getAll,
    getAllbyId,
    getById,
    inTime,
    OutTime,
    update,
    delete: _delete
};

async function authenticate({ email, password }) {
    const user = await db.Attendace.scope('withHash').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'email or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.Attendace.findAll();
}

async function getAllbyId(userID) {
    const user = await db.Attendace.findAndCountAll({ where: { userID } });
    let data = {
        count: user.count,
        data: user.rows,
        status : 0
     }
    return await data
}

async function getById(id) {
    return await getUser(id);
}

async function inTime(params) {
    
    let userID = params.userID

    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    
    // current year
    let year = date_ob.getFullYear();
    
    // current hours
    let hours = date_ob.getHours() % 12 ;
    
    // current minutes
    let minutes = date_ob.getMinutes();
    
    let ampm = date_ob.getHours() < 12 ? "AM" : "PM";
    
    // current seconds
    let seconds = date_ob.getSeconds();

    let currentDate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
    let currentdate =  year + "-" + month + "-" + date ;

    const user = await db.Attendace.findAndCountAll({ where: { userID } });
    
  //check user Alreadylogin 
    for (let i = 0; i < user.count; i++) { 
        // console.log('messageLoad',timesplit)
        var timesplit = user.rows[i].inTime.split(' ')[0];
        console.log(currentdate.toString )
        console.log(timesplit.toString)
       
        if (currentdate === timesplit){
            if (user) throw 'already login';
           return user;
        }
      }
    // params.appliedLeave = 0
    params.inTime =  currentDate
    params.inSatus = "1"
    await db.Attendace.create(params);

}

//..out time outTime
async function OutTime(params) {
   
    let userID = params.userID
  
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    
    // current year
    let year = date_ob.getFullYear();
    
    // current hours
    let hours = date_ob.getHours() % 12 ;
    
    // current minutes
    let minutes = date_ob.getMinutes();
    
    // current seconds
    let seconds = date_ob.getSeconds();

    let ampm = date_ob.getHours() < 12 ? "AM" : "PM";

    let currentDate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
    
    let currentdate =  year + "-" + month + "-" + date ;

    const user = await db.Attendace.findAndCountAll({ where: { userID } });
    var inTimeStatus = ""
    var inTimeDate = ""
    //...check user Alreadylogin 
    
    for (let i = 0; i < user.count; i++) { 
        var inTimestm = user.rows[i].inTime.split(' ')[0];
        if (inTimestm == currentdate){
            inTimeDate = user.rows[i].inTime;
        }
        if (user.rows[i].outTime != null){
            var timesplit = user.rows[i].outTime.split(' ')[0];
            if (currentdate == timesplit){
                if (user) throw 'already logout';
            return user;
            }
        }
    }

    const users = await getUserID(params.userID);
    params.outTime =  currentDate
    users.update({
        params: params.outTime,
        params: params.outStatus =  "1"
    },{ where: { userID: params.userID }});


    console.log('outtimeDate',currentDate)
    console.log('intimedate',inTimeDate)
    var diff =(new Date(currentDate).getTime() - new Date(inTimeDate).getTime()) / 1000;
    diff /= 60;
    let matthdif =  Math.abs(Math.round(diff));
    console.log('timediffrene',matthdif)
    if (matthdif <= 480){
        console.log('send mail to not complete 8 hours')

    }
    // copy params to user and save
    Object.assign(users, params);
    await users.save();
    return omitHash(users.get());
}

async function getUserID(userID) {
    const user = await db.Attendace.findOne({ where: { userID: userID } })
    // const user = await db.User.findByPk(userID);
    if (!user) throw ' Not found';
    return user;
}

//..absent 




async function update(id, params) {
    const user = await getUser(id);

    // validate
    const emailChanged = params.email && user.email !== params.email;
    if (emailChanged && await db.Attendace.findOne({ where: { email: params.email } })) {
        throw 'email "' + params.email + '" is already taken';
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

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.Attendace.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}