const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var request = require('request');
const nodemailer = require("nodemailer");
const { Sequelize, Op } = require("sequelize");
const userService = require('./otp.service');
const sgMail = require('@sendgrid/mail');
const { response } = require('express');
// const attendanceService = require('../users/user.service');

const apiKey =
    process.env.SENDGRID_API_KEY ||
    "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";
const apikeySms = "https://http-api.d7networks.com/send"

sgMail.setApiKey(apiKey);

module.exports = {
    sendOtpToEmail,
    validOtp,
    sendOtpMobile,
    resendOtpToEmail,
   
    // forgotpasswordtoEmail
};

//...create user
async function sendOtpToEmail(params) {

  console.log('email',params.to)
  let toMail = params.to
  var rand = Math.floor(Math.random() * 1000000);
  var randStr = rand
  var objc = {}
  
  let randomnumber = 'ConfimrationCode' + '\n' + randStr
 
  objc.otp = randStr;
  objc.email = toMail;

   
    var msg = {
        to: toMail,
        from: 'Sevenchats.blr@gmail.com',
        subject: 'code',
        text: 'conformation Code',
        html: randomnumber,
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


//..send otp to mobile number 
async function sendOtpMobile(params) {

  var rand = Math.floor(Math.random() * 10000);
  var randStr = rand.toString()
  params.otp = randStr
  params.mobileNo = params.mobileNo


  var options = {
    'method': 'POST',
    'url': 'https://http-api.d7networks.com/send?username=duar8601&password=fFXfa6IC&dlr-method=POST&dlr-url=https://4ba60af1.ngrok.io/receive&dlr=yes&dlr-level=3&from=1234&content=This is the sample content sent to test &to=9966141512',
    'headers': {

    },
    formData: {
  
    }
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log('response.body',response.body);
  });

//recvied opt for 

}


//validatation for OTP 
async function validOtp(param) {
    const user = await db.Otp.findOne({ where: { email:param.email}})
    if (param.otp != user.otp) throw 'Otp Does not Match';
    return user;
}

//...create user
async function resendOtpToEmail(param) {

  let toMail = param.to
  var rand = Math.floor(Math.random() * 1000000);
  var randStr = rand
  var objc = {}
  
  let randomnumber = 'ConfimrationCode' + '\n' + randStr
 
  objc.otp = randStr;
  objc.email = toMail;

    var msg = {
        to: toMail,
        from: 'Sevenchats.blr@gmail.com',
        subject: 'code',
        text: 'conformation Code',
        html: randomnumber,
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

      const user = await db.Otp.findOne({ where: { email:toMail}})
      Object.assign(user, objc);
      await user.save();

}


//...send Email To applied Leave 
async function sendReminderAtd(params) {

    var msg = {
        to: params.sendTo,
        from: 'Sevenchats.blr@gmail.com',
        subject:params.titleType,
        text: params.titleType,
        html: params.descriptionType,
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

}


async function sendLeaveToEmail(params) {
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
sendLeaveToEmail().catch(console.error);


