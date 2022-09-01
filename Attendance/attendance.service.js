const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var dateTime = require('node-datetime');
const { text } = require('body-parser');
var moment = require('moment');
const { param } = require('./attendance.controller');
const userservice = require('../users/user.service');
const userserviceLeave = require('../LeaveManagment/leaveManagment.service');
const date_ob = new Date();
const { Sequelize, Op } = require("sequelize");
const sgMail = require('@sendgrid/mail');
const { months } = require('moment');
const { ConsoleMessage } = require('puppeteer');


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
    empabsent,
    getbyDate,
    getbyDiffDate,
    updateLeaveAtd,
    update,
    getreminderById,
    delete: _delete,
    caluclateAtd,
    caluclateLeaveMng
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
    return await user.rows[0]
    
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

async function 
inTime(params) {
    
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
    for (let i = 0; i < user.count; i++) { 
        if (user.rows[i].startDate == currentdate){
        var timesplit = user.rows[i].inTime.split(' ')[0];
        if (currentdate === timesplit){
            if (user) throw 'already login';
           return user;
        }
        }
      }
    // params.appliedLeave = 0
    params.inTime =  currentDate
    params.startDate = currentdate 
    params.inStatus = "1"
    params.holidayStatus  = 5
    params.present = 1
    //add empty values 

    params.outStatus = "0"
    params.absentDay = "0"
    params.outTime = "0"
    params.leaveType = "0"
    params.endDate = "0"
    params.leaveStatus = "0"
    params.leaveCount = 0
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
        if (user.rows[i].startDate == currentdate){
        var inTimestm = user.rows[i].inTime.split(' ')[0];
        if (inTimestm == currentdate){
            inTimeDate = user.rows[i].inTime;
        }
    }
    if (user.rows[i].startDate == currentdate){
        if (user.rows[i].outTime != null){
            var timesplit = user.rows[i].outTime.split(' ')[0];
            if (currentdate == timesplit){
                if (user) throw 'already logout';
            return user;
            }
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
       const userinfo = await db.User.findOne({ where: { userID:userID}});
       objc.sendTo = userinfo.email
       objc.titleType = 'REMINDER OF TIME LINE'
       objc.descriptionType = 'YOUR NOT COMPLETED THE 8 HOUTS SO GENTLE REMINDER TO FINISH NEXT TIME',
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
    obj.userID = params.userID;
    obj.startDate = params.startDate;
    obj.endDate = params.startDate;
    obj.leaveType = params.leaveType;
    obj.holidayStatus = params.holidayStatus;
    obj.leaveStatus = params.leaveStatus;
    obj.present = params.present;
    
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
   var endDate = params.endDate;
   let holidayStatus = 0
   var listDate = [];
   let obj = {};
   obj.leaveStatus = leaveStatus ?? {}
   
    const user = await db.Attendace.findOne({ where: { userID: userID,startDate:startDate,leaveType:leaveType}})

  //calculate the leave mangagement 

        while (strDate < endDate){
        var strDate = dateMove.toISOString().slice(0,10);
        listDate.push(strDate);
        dateMove.setDate(dateMove.getDate()+1);
        };
    var givenDate = new Date(startDate);
    var currentDay = givenDate.getDay();
    var dateIsInWeekend = (currentDay === 6) || (currentDay === 0);

    if(params.leaveType == 1 || params.leaveType == 2){
            if(dateIsInWeekend==true){
            } else {
                const users = await caluclateLeaveMng(params);
            }
        }
    
    if (user.holidayStatus == 0){

        if (leaveStatus == 2){
        obj.holidayStatus = 2; 

     } else if (params.leaveType == 4 ) {
        obj.holidayStatus = 4; 
    }else {
        obj.holidayStatus = 5
        obj.leaveCount = 1

     }

     Object.assign(user, obj ?? {});
    await user.save();
    return omitHash(user.get());
     }else {
        Object.assign(user, obj ?? {});
        await user.save();
        return omitHash(user.get());
    }
    
   
}

//..absent 
//update the leve attendance 
async function empabsent(params) {
    
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
        if (user.rows[i].startDate == currentdate){
        var timesplit = user.rows[i].inTime.split(' ')[0];
        if (currentdate === timesplit){
            if (user) throw 'already absent Done';
           return user;
        }
      }
    }
    params.inTime =  currentDate
    params.startDate = currentdate 
    params.endDate = currentdate 
    params.holidayStatus  = 6
    params.absentDay  = 1
    await db.Attendace.create(params);

 }
//enter otp 
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
    let datas = [];
 
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

       var date_ob = new Date();
       let monthName = monthNames[date_ob.getMonth()];
       //downdload moths wise 

    //    let monthName = monthNames[date_ob.getMonth()];

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

        const userabsent = await db.Attendace.findAll({
            where: {
                userID:userID,holidayStatus:1,
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
        const userLeave = await db.Attendace.findAll({
            where: {
                userID:userID,leaveCount:1,
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



        console.log('countdata')
        if (!user) throw ' Not found';
        if (user.count == 0){
            data = {
                "error":'Search Items Notfound',
                status : 400
             }
        }
        if (user.count != 0){
             data = {
                absentCount:userabsent,
                leavedate:userLeave,
                data: user,
                status : 200
             }
        }

        return data
}

//leave mangagement 
async function caluclateLeaveMng(params) {
   
    const user = await db.LeaveManagment.findOne({ where: { userID: params.userID } })
    if (!user) throw ' Not found';
    let objc = {};
    let sickleave = user.sickLeaves;
    let casualleave = user.leaveType;
    if (params.leaveType == 1){
        sickleave = sickleave - 1; 

    }else if(params.leaveType == 2){
    casualleave = casualleave - 1 ; 
    }
    objc.userID = params.userID;
    objc.casualLeaves = casualleave;
    objc.sickLeaves = sickleave;
    await userserviceLeave.update(params.userID,objc)

    return user;

}