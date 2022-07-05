const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const nodemailer = require("nodemailer");
const { Sequelize, Op } = require("sequelize");
const userService = require('./otp.service');
const sgMail = require('@sendgrid/mail')
const apiKey =
    process.env.SENDGRID_API_KEY ||
    "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";


sgMail.setApiKey(apiKey);

module.exports = {
    // authenticate,
    // getAll,
    // getAlls,
    // getById,
    create,
    validOtp
    // resetPassword,
    // update,
    // delete: _delete,
    
};


//...create user
async function create(params) {

    var rand = Math.floor(Math.random() * 10000);
    var randStr = rand.toString()
    params.otp = randStr
    params.mobileNo = "1234"


//recvied opt for 

  let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'nagarajukios85@gmail.com', // generated ethereal user
      pass: '2caLzXZ8PwJIn7Qk', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <nagarajukios85@gmail.com>', // sender address
    to: "chinnu2123@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

    var msg = {
        to: 'chinnu2123@gmail.com',
        from: 'nagarajukios85@gmail.com',
        subject: 'hi',
        text: 'bye',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };

      sgMail
        .send(msg)
        .then(() => {
          logger.debug("Email sent");
          sendResponse(
            res,
            response.error === undefined
              ? "Success!"
              : "Something went wrong!", //token
            response.error
          );
        })
        .catch((error) => {
          console.error(error);
        });
    
}

//validatation for OTP 
async function validOtp() {
    const user = await db.Otp.findOne({ where: { userID: userID } })
    // const user = await db.User.findByPk(userID);
    if (!user) throw 'User not found';
    return user;
}

