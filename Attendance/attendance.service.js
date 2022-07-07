const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var dateTime = require('node-datetime');
const { text } = require('body-parser');

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

async function getAllbyId(userid) {
    const user = await db.Attendace.findAndCountAll({ where: { userid } });
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
    
    let userid = params.userid
    var dt = dateTime.create();
    var formatted = dt.format('d-m-Y H:M:S');
    var currentdate = dt.format('d-m-Y');
    const user = await db.Attendace.findAndCountAll({ where: { userid } });
    
  //check user Alreadylogin 
    for (let i = 0; i < user.count; i++) { 
        // console.log('messageLoad',timesplit)
        var timesplit = user.rows[i].inTime.split(' ')[0];
       
        if (currentdate.toString === timesplit.toString){
            if (user) throw 'already login';
           return user;
        }
      }
    params.inTime =  formatted
    params.inSatus = "1"
    await db.Attendace.create(params);

}

//..out time outTime
async function OutTime(params) {
   
    let userid = params.userid
    var dt = dateTime.create();
    var formatted = dt.format('d-m-Y H:M:S');
    var currentdate = dt.format('d-m-Y');
    const user = await db.Attendace.findAndCountAll({ where: { userid } });
    //...check user Alreadylogin 
    
    for (let i = 0; i < user.count; i++) { 
        var timesplit = user.rows[i].outTime.split(' ')[0];
        var inTimeload = user.rows[i].inTime.split(' ')[1];
        console.log('messageLoad',timesplit)
        if (currentdate.toString === timesplit.toString){
            if (user) throw 'already logout';
        return user;
        }else {
            
            var inTimeload = user.rows[i].inTime.split(' ')[1];
            var timesplit = user.rows[i].outTime.split(' ')[0];
        }
    }
    const users = await getUserID(params.userid);
    users.update({
        params: params.outTime,
        params: params.inSatus =  "1"
    },{ where: { userid: params.userid }});

    // copy params to user and save
    Object.assign(users, params);
    await user.save();
    return omitHash(users.get());
}

async function getUserID(userid) {
    const user = await db.Attendace.findOne({ where: { userid: userid } })
    // const user = await db.User.findByPk(userID);
    if (!user) throw 'User not found';
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