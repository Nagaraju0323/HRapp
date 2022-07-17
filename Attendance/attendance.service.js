const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var dateTime = require('node-datetime');
const { text } = require('body-parser');
var moment = require('moment');
const { param } = require('./attendance.controller');
// const sentmailService = require('../Otp/otp.service');
const userservice = require('../users/user.service');
const date_ob = new Date();
const { Sequelize, Op } = require("sequelize");
const sgMail = require('@sendgrid/mail');
const { months } = require('moment');
let data = [];

const apiKey =
    process.env.SENDGRID_API_KEY ||
    "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";
const apikeySms = "https://http-api.d7networks.com/send"

sgMail.setApiKey(apiKey);

module.exports = {
    authenticate,
    getAll,
    getAllbyId,
    getById,
    inTime,
    leaveAttendance,
    OutTime,
    getbyDate,
    getbyDiffDate,
    updateLeaveAtd,
    update,
    getreminderById,
    delete: _delete,
    caluclateAtd
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

async function getbyDate(userID,params) {
    let currentdate = params.date 
    console.log('dateformat',currentdate)
    const user = await db.Attendace.findAndCountAll({ where: { userID:userID,startDate:currentdate } });
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

    const user = await db.Attendace.findAll({
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
        if (currentdate === timesplit){
            if (user) throw 'already login';
           return user;
        }
      }
    // params.appliedLeave = 0
    params.inTime =  currentDate
    params.startDate = currentdate 
    params.inStatus = "1"
    params.holidayStatus  = 5
    params.present = 1
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
    
    var inTimeDate = ""
    var objc = {};
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

    const users = await getUserIDDate(params.userID,inTimeDate);
    params.outTime =  currentDate
    params.endDate =  currentdate
    users.update({
        params: params.outTime,
        params: params.endDate,
        params: params.outStatus =  "1",
        params:holidayStatus  = 5,
        params:present = 1
    },{ where: { userID: params.userID }});

    var diff =(new Date(currentDate).getTime() - new Date(inTimeDate).getTime()) / 1000;
    diff /= 60;
    let matthdif =  Math.abs(Math.round(diff));
    if (matthdif <= 480){
        //send mail to particular person 
        console.log('send mail to not complete 8 hours')
 
       const userinfo = await db.User.findOne({ where: { userID:userID}});
      
       console.log('useremailID',userinfo.email)

       objc.sendTo = userinfo.email
       objc.titleType = 'REMINDER OF TIME LINE'
       objc.descriptionType = 'YOUR NOT COMPLETED THE 8 HOUTS SO GENTLE REMINDER TO FINISH NEXT TIME',
    //    await sentmailService.sendReminderAtd(objc);
        getreminderById(objc)

    }
    // copy params to user and save
    Object.assign(users, params);
    await users.save();
    return omitHash(users.get());
}


//leave attenance 
async function leaveAttendance(params) {
    let obj = {};
    obj.userID = params.userID
    obj.startDate = params.startDate
    obj.endDate = params.startDate
    obj.leaveType = params.leaveType
    obj.holidayStatus = params.holidayStatus
    obj.present = params.present


    await db.Attendace.create(obj);

}

async function getUserID(userID) {
    const user = await db.Attendace.findOne({ where: { userID: userID } })
    if (!user) throw ' Not found';
    return user;
}

//..absent 
async function getUserIDDate(userID,params) {

    let currentdate = params
    const user = await db.Attendace.findOne({ where: { userID: userID,inTime:currentdate } })
    if (!user) throw ' Not found';
    return user;
}

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

//update the leve attendance 
async function updateLeaveAtd(params) {
  
   let userID = params.userID;
   let startDate = params.startDate;
   let leaveType = params.leaveType
   let leaveStatus = params.leaveStatus
   let holidayStatus = 0
   let obj = {};
   obj.leaveStatus = leaveStatus ?? {}
   
    const user = await db.Attendace.findOne({ where: { userID: userID,startDate:startDate,leaveType:leaveType}})
    if (user.holidayStatus == 0){

     obj.holidayStatus = 5  
     Object.assign(user, obj ?? {});
    await user.save();
    return omitHash(user.get());

    }else {

        Object.assign(user, obj ?? {});
        await user.save();
        return omitHash(user.get());
    }

    
   
}
//enter otp 

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

async function getreminderById(params) {
    console.log('email',params.to)
    let toMail = params.sendTo
    var rand = Math.floor(Math.random() * 1000000);
    var randStr = rand
    var objc = {}
    
    let randomnumber = 'ConfimrationCode' + '\n' + randStr
   
    objc.otp = randStr;
    objc.email = toMail;
  
    var msg = {
          to: toMail,
          from: 'Sevenchats.blr@gmail.com',
          subject: 'REMINDER OF TIME LINE',
          text: 'conformation Code',
          html: 'YOUR NOT COMPLETED THE 8 HOUTS SO GENTLE REMINDER TO FINISH NEXT TIME',
        };
  
        sgMail
          .send(msg)
          .then((result) => {
            console.log('sg mail res')
            console.log(result)
        
            return 'Success';
          })
          .catch((error) => {
            console.trace('catch of sgmail')
            console.error(error);
            //throw new Error(error.message);
          });
  
        await db.Otp.create(objc); 
    
}

  async function caluclateAtd(params) {

    let userID = params.userID;
 
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

       var date_ob = new Date();
       let monthName = monthNames[date_ob.getMonth()];

       let yearName = date_ob.getFullYear();
        
        let fullDate = monthName  + " " +  yearName; 
    
        var current_month = fullDate;
        var arrMonth = current_month.split(" ");
        var first_day = new Date(arrMonth[0] + " 1 " + arrMonth[1]);
        var last_day = new Date(first_day.getFullYear(), first_day.getMonth() + 1, 0, 23, 59, 59);
        var startdate = moment(first_day).format("YYYY-MM-DD");
        var endDate = moment(last_day).format("YYYY-MM-DD");
    
        const user = await db.Attendace.findAll({
            where: {
                userID:userID,holidayStatus:5,
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
 
        if (!user) throw ' Not found';
        if (user.count == 0){
            data = {
                "error":'Search Items Notfound',
                status : 400
             }
        }
        if (user.count !=0){
             data = {
                data: user,
                status : 200
             }
        }
        return await data
}
