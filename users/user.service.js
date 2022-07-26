const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./user.service');
const sgMail = require('@sendgrid/mail');
const axios = require('axios').default;
const apiKey =
    process.env.SENDGRID_API_KEY ||
    "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";
const apikeySms = "https://http-api.d7networks.com/send"

sgMail.setApiKey(apiKey);

// const otpService = require('../Otp/otp.service');

module.exports = {
    authenticate,
    authenticatetoMobile,
    getAll,
    getAlls,
    getById,
    getByUserID,
    create,
    resetPassword,
    update,
    userupdateID,
    userprofileUpdate,
    user_delete,
    forgotpassword,
    validOtp,
    updateuserBank,
    sendOtpToMobile,
    sendOtpToMobile_valid
    
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

//...user Login mobile
async function authenticatetoMobile({ mobileNo, password }) {
  
    const user = await db.User.scope('withHash').findOne({ where: { mobileNo } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'email or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}



//...GetAll UserInformation
async function getAll() {
    let data = [];
    let users = await db.User.findAll()
    data = {
        "data": users,
        status : 200
     }
    return data;
}
//...search with UserInformation
async function getAlls(search) {
    let data = [];
    const user = await db.User.findAll({
            where: Sequelize.where(Sequelize.fn("concat", Sequelize.col("firstName"), Sequelize.col("lastName")), {
                [Op.like]: '%' + search + '%',

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
    console.log('this')
    return await getUserID(userID);
}


//...create user
async function create(params) {
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw 'email "' + params.email + '" is already taken';
    }

    if (await db.User.findOne({ where: { mobileNo: params.mobileNo } })) {
        throw 'mobileNo "' + params.mobileNo + '" is already taken';
    }
    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }
    // savepassword
    var rand = Math.floor(Math.random() * 1000000);
    var randStr = rand
    params.userID = randStr

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
//..userupdateByUserid
async function userupdateID(userID, params) {
    const user = await getUserID(userID);

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
//..update user profile


async function userprofileUpdate(userID, params) {
    const user = await getUserID(userID);
    const file = fs.readFileSync(params.profileImg);
    const base64String = Buffer.from(file).toString('base64');
    console.log(base64String)
  

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}


async function updateuserBank(userID, params) {
   
    let objc = {};
    console.log('account',objc)
    const user = await db.User.findOne({ where: { userID:userID } })
    objc.accountNo = params.accountNo;
    objc.Doj = params.Doj
    objc.bankName = params.bankName;
    objc.PAN = params.PAN
   
    // copy params to user and save
    Object.assign(user, objc);
    await user.save();

    return omitHash(user.get());
}



//...reset Password userInfo
async function resetPassword(userID, params) {
    const user = await getUserID(userID);
    // hash password if it was entered
    if (params.password) {
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

async function user_delete(userID) {
    const user = await getUserID(userID);
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

//update Otp 

async function forgotpassword(param) {
    var objc = {}
    const user = await db.User.findOne({ where: { email: param.email } })
    objc.email = user.email
    // await forgotpasswordtoEmail(objc)

    let toMail = user.email
    console.log('email',toMail)
    var rand = Math.floor(Math.random() * 1000000);
    var randStr = rand
    
    
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
  
         //delete the existed otps 
         const users = await db.Otp.findOne({ where: { email:param.email}})
         if (!users) {
            await db.Otp.create(objc);
         }else {
            await users.destroy();
            await db.Otp.create(objc);
         }
   
    // // // const user = await db.User.findByPk(userID);
    // if (!user) throw 'User not found';
    // return user;
}


async function sendOtpToMobile(param) {
    var objc = {}
    const user = await db.User.findOne({ where: { mobileNo: param.mobileNo } })
    objc.mobileNo = user.mobileNo
    // await forgotpasswordtoEmail(objc)

    let toMobile = user.mobileNo
    
    var rand = Math.floor(Math.random() * 1000000);
    var randStr = rand
    
    
    let randomnumber = 'ConfimrationCode' + '\n' + randStr
   
    objc.otp = randStr;
    objc.mobileNo = toMobile;


    axios({
        method: 'get',
        url: 'https://api.textlocal.in/send/',
       
        params: {

            apikey:'N2E0MzdhNjk0NjYxNDQ0NjRmNDE2YjQ5NDE0ZTY4NjM=',
            numbers:9966141512,
            sender:'SEVNAU',
            message:'We have received a request for password change of your Sevenchats account, If you wish to proceed then please click the link'+'  '+ randStr +', if you did not request then please ignore this message.'
            // message:'use' + randomnumber + 'as your verification code on Sevenchats the otp exprire in 10 minsTeam Sevenchats '

        }



      }).then(function (response) {
       console.log(response)
      });
  
         //delete the existed otps 
         const users = await db.Otp.findOne({ where: { mobileNo:param.mobileNo}})
         if (!users) {
             console.log('users')
            await db.Otp.create(objc);
            //callingin the apit
            sendOtpToMobile_valid(mobileNo)
            // request.post(html_code, {form:{key:'value'}})

            
         }else {
            console.log('users2')
            await users.destroy();
            await db.Otp.create(objc);
            // sendOtpToMobile_valid(mobileNo)
          
         }
   
    // // // const user = await db.User.findByPk(userID);
    // if (!user) throw 'User not found';
    return user;
}

async function validOtp(param) {
    const user = await db.Otp.findOne({ where: { email:param.email}})
    if (param.otp != user.otp) throw 'Otp Does not Match';
    return user;
}


async function sendOtpToMobile_valid(param) {
    console.log(param)
    // const user = await db.Otp.findOne({ where: { email:param.email}})
    // if (param.otp != user.otp) throw 'Otp Does not Match';
    // return user;
    let html_code = "https://api.textlocal.in/send/?apikey=N2E0MzdhNjk0NjYxNDQ0NjRmNDE2YjQ5NDE0ZTY4NjM=&numbers=9966141512&sender=SEVNAU&message=We have received a request for password change of your Sevenchats account, If you wish to proceed then please click the link https://sevenchats.com, if you did not request then please ignore this message.";
    request(html_code, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body) // Print the google web page.
     }
})
return 'logmessage'


}
