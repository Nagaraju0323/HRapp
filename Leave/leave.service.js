const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./leave.service');
const attendanceService = require('../Attendance/attendance.service');
const compoOffService = require('../Compoff/compoff.service');
// const otpService = require('../Otp/otp.service');
const emailService = require('../Email/email.service');
const { BlockDomain } = require('sib-api-v3-sdk');
const { send } = require('express/lib/response');
const nodemailer = require("nodemailer");
const leaveManagmentService = require('../LeaveManagment/leaveManagment.service');
const { param } = require('./leave.controller');
const e = require('cors');
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
    compareLeavemanagement,
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
    // if (user.count ==0){
    //     data = {
    //         "error":'Search Items Notfound',
    //         status : 400
    //      }
    // }
    // if (user.count !=0){
    //     data = {
    //         count: user.count,
    //         data: user.rows,
    //         status : 0
    //      }
    // }
    return await user.rows
}


//...create user
async function create(params) {

    let userID = params.userID;
    var listDate = [];
    let newArray = [];
    var obj = {}
    var startDate =params.startDate;
    var endDate = params.endDate;
    var dateMove = new Date(startDate);
    var strDate = startDate;
   
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
    if (params.leaveType == 3){
        console.log('workfromhome')

        while (strDate < endDate){
            var strDate = dateMove.toISOString().slice(0,10);
            listDate.push(strDate);
            dateMove.setDate(dateMove.getDate()+1);
          };
    
          if (listDate.length == 0){
        obj.userID = params.userID
        obj.startDate = startDate
        obj.leaveType = params.leaveType

        var givenDate = new Date(startDate);
        var currentDay = givenDate.getDay();
        var dateIsInWeekend = (currentDay === 6) || (currentDay === 0);
        if(dateIsInWeekend==true){

            obj.leaveStatus = 3
            obj.holidayStatus  = 0
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
                obj.leaveStatus = 3
                obj.holidayStatus  = 2
                await attendanceService.leaveAttendance(obj);
            }else {
                obj.leaveStatus = 3
                obj.holidayStatus  = 0
                await attendanceService.leaveAttendance(obj);
            }
        }
          }else {
        
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
        
                    obj.holidayStatus  = 0
                    obj.leaveStatus = 3
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
                        obj.leaveStatus = 3
                        await attendanceService.leaveAttendance(obj);
                    }else {
                        obj.leaveStatus = 3
                        obj.holidayStatus  = 0
                        await attendanceService.leaveAttendance(obj);
                    }
                }
              }

      }

    }else {
       //..more than one day present  
    while (strDate < endDate){
      var strDate = dateMove.toISOString().slice(0,10);
      listDate.push(strDate);
      dateMove.setDate(dateMove.getDate()+1);
    };

    if (listDate.length == 0){

        console.log('today only');
        //..current Day Attendance with Leave
        obj.userID = params.userID
        obj.startDate = startDate
        obj.leaveType = params.leaveType

        var givenDate = new Date(startDate);
        var currentDay = givenDate.getDay();
        var dateIsInWeekend = (currentDay === 6) || (currentDay === 0);
        if(dateIsInWeekend==true){

            obj.holidayStatus  = 1
            obj.leaveStatus = 3
            //cross check if user had leave or not 
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
                obj.leaveStatus = 3
                obj.holidayStatus  = 2
                await attendanceService.leaveAttendance(obj);
            }else {
                obj.leaveStatus = 3
                obj.holidayStatus  = 0
                await attendanceService.leaveAttendance(obj);
            }

        }


    }else {

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
            obj.leaveStatus = 3
            await attendanceService.leaveAttendance(obj);
           
        } else {
          let status = 0
           let users = await db.Holiday.findAll()
           for (let i = 0; i < users.length; i++) { 
           let holiday = users[i].holidayDate; 
            newArray.push(holiday);
             }
             if (newArray.includes(startDate)) {
                obj.holidayStatus  = 2
                obj.leaveStatus = 3
                await attendanceService.leaveAttendance(obj);
            }else {
                obj.leaveStatus = 3
                obj.holidayStatus  = 0
                await attendanceService.leaveAttendance(obj);
            }
        }
      }
    }
  }

    params.leaveStatus = 3
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
  
    }
}

async function getbyDate(params) {
    // let currentdate = params.startDate 
    console.log('messapram',params)
    // consoel
    // console.log('dateformat',params)
    // const user = await db.Leave.findAndCountAll({ where: { userID:userID,startDate:currentdate } });
    const user = await db.Leave.findAndCountAll({ where: { startDate : params} });

    // if (user.count == 0){
    //     data = {
    //         "error":'Search Items Notfound',
    //         status : 400
    //      }
    // }
    // if (user.count != 0){
    //      data = {
    //         count: user.count,
    //         data: user.rows,
    //         status : 200
    //      }
    // }
    
    return await user.rows
    
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
   console.log('this is message');
    let startDate = params.startDate
    let startDateFrm = params.startDate
    let objcCompoOff = {};
    const user = await getUserIDDate(userID,startDate);
    Object.assign(user, params);
    await user.save();
    var listDate = [];
    var obj = {};
    var endDate = params.endDate;
    var dateMove = new Date(startDate);
    var strDate = startDate;
    obj.userID = params.userID
        obj.startDate = strDate
        obj.leaveType = params.leaveType
        obj.leaveStatus = params.leaveStatus
        obj.holidayStatus = params.holidayStatus
     while (strDate < endDate){
            var strDate = dateMove.toISOString().slice(0,10);
            listDate.push(strDate);
            dateMove.setDate(dateMove.getDate()+1);
         };
         if (listDate.length == 0){
            await attendanceService.updateLeaveAtd(obj);
            
         }else {
            for (let i = 0; i < listDate.length; i++) { 
                let startDate = listDate[i]
                 obj.userID = params.userID
                 obj.startDate = startDate
                 obj.leaveType = params.leaveType
                 obj.leaveStatus = params.leaveStatus
                 obj.holidayStatus = params.holidayStatus
                 await attendanceService.updateLeaveAtd(obj);
                
  
                }
            }
       
      if (params.leaveType == 4){
        objcCompoOff.userID = params.userID;
        objcCompoOff.resonOf =  user.titleType;
        objcCompoOff.applydate =  params.startDate;
        compoOffService.create(objcCompoOff);
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

//leavemanagment 

async function compareLeavemanagement(params) {

    let userID = params.userID;
    var listDate = [];
    let newArray = [];
    var obj = {}
    var startDate =params.startDate;
    var endDate = params.endDate;
    var dateMove = new Date(startDate);
    var strDate = startDate;
    let LeaveApplyDate  = params.startDate;
    let objc = {};
    let CountInc = 0

    while (strDate < endDate){
      var strDate = dateMove.toISOString().slice(0,10);
      listDate.push(strDate);
      dateMove.setDate(dateMove.getDate()+1);
    };

    if (listDate.length == 0){
 
        obj.userID = params.userID
        obj.startDate = startDate
        obj.leaveType = params.leaveType

        var givenDate = new Date(startDate);
        var currentDay = givenDate.getDay();
        var dateIsInWeekend = (currentDay === 6) || (currentDay === 0);
        if(dateIsInWeekend==true){
           
        } else {
          let status = 0
           let users = await db.Holiday.findAll()
           for (let i = 0; i < users.length; i++) { 
           let holiday = users[i].holidayDate; 
            newArray.push(holiday);
             }
            if (newArray.includes(startDate)) {

            }else {
                CountInc = CountInc + 1;
            }
        }
    }else {
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
           
        } else {
          let status = 0
           let users = await db.Holiday.findAll()
           for (let i = 0; i < users.length; i++) { 
           let holiday = users[i].holidayDate; 
            newArray.push(holiday);
             }
             if (newArray.includes(startDate)) {
                
            }else {
                obj.leaveStatus = 3
                obj.holidayStatus  = 0
                CountInc = CountInc + 1;
            }
        }
      }
  }

  const userleave = await db.LeaveManagment.findOne({ where: { userID:params.userID} });
  let data = [];
  if (params.leaveType == 1){
    if (userleave.casualLeaves >= CountInc){
        data = {
            "message":"user had leaves",
            "success":200
        }
      } 
   }else {
    data = {
        "message":"No leaves",
        "success":400
    }
   }
   if (params.leaveType == 2) {
    if (userleave.sickLeaves >= CountInc){
        data = {
            "message":"user had leaves",
            "success":200
        }
    } 
 }else {
    data = {
        "message":"No leaves",
        "success":400
    }
 }
   return data;
}

async function getsendLeave(params) {
 
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
