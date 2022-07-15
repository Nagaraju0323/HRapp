const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./leave.service');
const attendanceService = require('../Attendance/attendance.service');
// const otpService = require('../Otp/otp.service');
const emailService = require('../Email/email.service');
const { BlockDomain } = require('sib-api-v3-sdk');
const { send } = require('express/lib/response');
const nodemailer = require("nodemailer");
let data = [];
module.exports = {
    authenticate,
    getAll,
    create,
    getAllbyId,
    getbyDate,
    update,
    approvedLeave,
    getUserID,
    getbyDiffDate,
    delete: _delete,
    getsendLeave,
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
    let user = db.Leave.findAll()
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
    
    //..check with User Applied or not 
    let userID = params.userID;
    let LeaveApplyDate  = params.startDate;
    let objc = {};

    const user = await db.Leave.findAndCountAll({ where: { userID } });
        //check user Alreadylogin 
        for (let i = 0; i < user.count; i++) { 
            // console.log('messageLoad',timesplit)
            var applyDate = user.rows[i].startDate;
            if (LeaveApplyDate === applyDate){
                if (user) throw 'already you applied Leave';
            return user;
            }
        }
    //udpate the attendance 
    var listDate = [];
    let newArray = [];
    var obj = {}
    var startDate =params.startDate;
    var endDate = params.endDate;
    var dateMove = new Date(startDate);
    var strDate = startDate;
    
    while (strDate < endDate){
      var strDate = dateMove.toISOString().slice(0,10);
      listDate.push(strDate);
      dateMove.setDate(dateMove.getDate()+1);
    };
    for (let i = 0; i < listDate.length; i++) { 
        var startDate = listDate[i]

        obj.userID = params.userID
        obj.startDate = startDate
        obj.leaveType = params.leaveType


     var startDate = listDate[i]
        var givenDate = new Date(startDate);
        var currentDay = givenDate.getDay();
        var dateIsInWeekend = (currentDay === 6) || (currentDay === 0);
        if(dateIsInWeekend==true){

            obj.holidayStatus  = 1
            await attendanceService.leaveAttendance(obj);
           
        } else {
          let status = 0
           let users = await db.Holiday.findAll()
           for (let i = 0; i < users.length; i++) { 
           let holiday = users[i].holidayDate; 
            newArray.push(holiday);
             }

            //  let status = newArray.indexOf(startDate) 
            if (newArray.includes(startDate)) {
                obj.holidayStatus  = 2
                await attendanceService.leaveAttendance(obj);
            }else {
                obj.holidayStatus  = 0
                await attendanceService.leaveAttendance(obj);
            }

            
        // await attendanceService.leaveAttendance(obj);
        }
    }

    params.holidayStatus = 1
    await db.Leave.create(params);
    //..send email to users  
    let sendToEmail = params.sendTo;
    let sendTo = sendToEmail['sendemail'];
    
    for (let i = 0; i < sendTo.length; i++) { 
        let toEmail = sendTo[i]['email']; 
       objc.sendTo = toEmail;
       objc.titleType = params.titleType;
       objc.descriptionType = params.descriptionType;
       objc.startDate = params.startDate;
       objc.endDate = params.endDate;
       objc.leaveType = params.leaveType;
       objc.senderEmail = params.senderEmail;
       getsendLeave(objc)
    //   await otpService.sendLeaveToEmail(objc);
    //   await emailService.create(toEmail);
    }

//..update the leave after leave applyed 
//.. user applied leave auto create leave pollicey 
  

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
    console.log(params.startDate);
    const user = await getUserIDDate(userID,startDate);
    // copy params to user and save
    Object.assign(user, params);
    await user.save();
    return omitHash(user.get());
}


async function approvedLeave(userID, params) {
   
   //approved Leave 
//    console.log('this messageCalling');
    let startDate = params.startDate
    let startDateFrm = params.startDate
    // console.log('mesage is done ',startDate);
    const user = await getUserIDDate(userID,startDate);
    Object.assign(user, params);
    await user.save();

    //leave approved 
    // await attendanceService.leaveAttendance(obj);

    var listDate = [];
    var obj = {};
    var endDate = params.endDate;
    var dateMove = new Date(startDate);
    var strDate = startDate;
    
    while (strDate < endDate){
      var strDate = dateMove.toISOString().slice(0,10);
      listDate.push(strDate);
      dateMove.setDate(dateMove.getDate()+1);
    };
    for (let i = 0; i < listDate.length; i++) { 
       let startDate = listDate[i]
        console.log('message',startDate);
        obj.userID = params.userID
        obj.startDate = startDate
        obj.leaveType = params.leaveType
        obj.leaveStatus = params.leaveStatus
        obj.holidayStatus = params.holidayStatus
        await attendanceService.updateLeaveAtd(obj);

        // await attendanceService.leaveAttendance(obj);
    }
    return omitHash(user.get());
}

async function _delete(userID,params) {
    let startDate = params.startDate
    const user = await getUserIDDate(userID,params);
    await user.destroy();
    
}

async function _deleteAll(userID) {
    const user = await getUserIDDelete(userID);

    for (let i = 0; i < user.count; i++) { 
        const users = await getUserID(userID);
        await users.destroy();
        
    }

}

// helper functions

async function getUser(id) {
    const user = await db.Leave.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

async function getUserIDDate(userID,params) {

    let currentdate = params
    const user = await db.Leave.findOne({ where: { userID: userID,startDate:currentdate } })
    if (!user) throw ' Not found';
    return user;
}

async function getUserIDDelete(userID) {
    
    const user = await db.Leave.findAndCountAll({ where: { userID:userID } });
    if (!user) throw ' Not found';
    return user;
}

async function getUserID(userID) {
    const user = await db.Leave.findOne({ where: { userID: userID } })
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}


async function getsendLeave(params) {
    // const user = await db.Leave.findOne({ where: { userID: userID } })
    // if (!user) throw 'User not found';
    // return user;

    let testAcc = {
        user: "nagaraju.kankanala@sevenchats.com",
        pass: "Omsairam@12345",
      };
      let transporter = nodemailer.createTransport({
        name:"http://webmail.sevenchats.com",
        host: "mail.sevenchats.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: testAcc.user,
          pass: testAcc.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      await transporter
        .sendMail({
          from: params.senderEmail,
          to: params.sendTo,
          subject: params.titleType,
          text: params.descriptionType,
        })
        .then((result) => {
          console.log(result.messageId);
          console.log(result.response);
        })
        .catch((err) => {
          console.error(err.message);
        });
    

}