const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
// const userService = require('./user.service');
const sgMail = require('@sendgrid/mail');
const axios = require('axios').default;
const apiKey =
    process.env.SENDGRID_API_KEY ||
    "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";
const apikeySms = "https://http-api.d7networks.com/send"
const mutler = require('multer');

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
    sentOtptoemail,
    validOtp,
    updateuserBank,
    sendOtpToMobile,
    sendOtpToMobile_valid,
    uploadProfileImg,
    validMobileOtp,
    sendOTPforgot,
    sendOTPforgotMobile,
    changePWDemail,
    changePWDmobile
    
};

//...user Login
async function authenticate({ email, password }) {
  
    const user = await db.User.scope('withHash').findOne({ where: { email } });
    
    console.log('user---------',user)
    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'email or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

//...user Login mobile
async function authenticatetoMobile({ mobileNo, password }) {
  
    const user = await db.User.scope('withHash').findOne({ where: { mobileNo } });
    console.log('user---------',user)

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
    params.accountNo = "0"
    params.Doj = "0"
    params.bankName = "0"
    params.PAN = "0"
    

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
//....update Bacnk details 
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

async function sentOtptoemail(param) {
    var objc = {}
    // const user = await db.User.findOne({ where: { email: param.email } })
    // if (await db.User.findOne({ where: { email: param.email } })) {
        
    
    objc.email = param.email
    // await forgotpasswordtoEmail(objc)

    let toMail = param.email
    console.log('email',toMail)
    var rand = Math.floor(Math.random() * 89999 + 10000);
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
        
        // else {
        //     throw 'email "' + param.email + '" is not in SevenchatsHR';
        // }
   
    // // // const user = await db.User.findByPk(userID);
    // if (!user) throw 'User not found';
    // return user;
}

//...reset Password userInfo
async function changePWDemail(param) {
 let params = {};
  params.password = param.password

 const userotp = await db.Otp.findOne({ where: { email:param.email}})
    if (param.otp != userotp.otp) throw 'Otp Does not Match';

    const user = await db.User.findOne({ where: { email: param.email } })
    console.log('-------userdetails',param.email)
    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

   user.update({
        params: params.hash 
    },{ where: { email: param.email}});

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    // return omitHash(user.get());

}


async function changePWDmobile(param) {
    let params = {};
     params.password = param.password
   
    const userotp = await db.Otp.findOne({ where: { mobileNo:param.mobileNo}})
       if (param.otp != userotp.otp) throw 'Otp Does not Match';
   
       const user = await db.User.findOne({ where: { mobileNo: param.mobileNo } })
       console.log('-------userdetails',param.email)
       // hash password if it was entered
       if (params.password) {
           params.hash = await bcrypt.hash(params.password, 10);
       }
   
      user.update({
           params: params.hash 
       },{ where: { mobileNo: param.mobileNo}});
   
       // copy params to user and save
       Object.assign(user, params);
       await user.save();
   
    //    return omitHash(user.get());
   
   }

//sentotp forGotPWD
async function sendOTPforgot(param) {
    var objc = {}
    // const user = await db.User.findOne({ where: { email: param.email } })
    if (await db.User.findOne({ where: { email: param.email } })) {
        // throw 'email "' + param.email + '" is already taken';
    
    objc.email = param.email
    // await forgotpasswordtoEmail(objc)

    let toMail = param.email
    console.log('email',toMail)
    var rand = Math.floor(Math.random() * 89999 + 10000);
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
   
        }else {
                throw 'email "' + param.email + '" is Not Register SevenchatHR APP';
        }
    // // // const user = await db.User.findByPk(userID);
    // if (!user) throw 'User not found';
    // return user;
}


async function sendOTPforgotMobile(param) {
    console.log('inside user.service:453')
    var objc = {}
    // const user = await db.User.findOne({ where: { mobileNo: param.mobileNo } })

    console.log('param.mobileNo',param.to);
    if (await db.User.findOne({ where: { mobileNo: param.to } })) {
        // throw 'mobileNo "' + param.mobileNo + '" is already taken';
    
    objc.mobileNo = param.to
    // await forgotpasswordtoEmail(objc)

    console.log('param.mobileNo',param.to);
    let toMobile = param.to
    
    // var rand = Math.floor(Math.random() * 100000);
    var rand = Math.floor(Math.random() * 89999 + 10000);
    var randStr = rand
    
    
    let randomnumber = 'ConfimrationCode' + '\n' + randStr
   
    objc.otp = randStr;
    objc.mobileNo = toMobile;


    axios({
        method: 'get',
        url: 'https://api.textlocal.in/send/',
       
        params: {

            apikey:'N2E0MzdhNjk0NjYxNDQ0NjRmNDE2YjQ5NDE0ZTY4NjM=',
            numbers:toMobile,
            sender:'SEVNAU',
            message:'We have received a request for password change of your Sevenchats account, If you wish to proceed then please click the link'+'  '+ randStr +', if you did not request then please ignore this message.'
            // message:'use' + randomnumber + 'as your verification code on Sevenchats the otp exprire in 10 minsTeam Sevenchats '

        }
      }).then(function (response) {
       console.log(response)
      });
     
         //delete the existed otps 
         const users = await db.Otp.findOne({ where: { mobileNo:param.to}})
         if (!users) {
            await db.Otp.create(objc);
           // sendOtpToMobile_valid(mobileNo)
         }else {
            // console.log('users2')
            await users.destroy();
            await db.Otp.create(objc);
            // sendOtpToMobile_valid(mobileNo)
          
         }
        }else {
             throw 'mobileNo "' + param.mobileNo + '" is Not Register SevnechatHR';
        }
   
    // // // const user = await db.User.findByPk(userID);
    // if (!user) throw 'User not found';
    // return users;
}

async function sendOtpToMobile(param) {
    var objc = {}
    // const user = await db.User.findOne({ where: { mobileNo: param.mobileNo } })

    console.log('param.mobileNo',param.to);
    // if (await db.User.findOne({ where: { mobileNo: param.to } })) {
       
    
    objc.mobileNo = param.to
    // await forgotpasswordtoEmail(objc)

    console.log('param.mobileNo',param.to);
    let toMobile = param.to
    
    // var rand = Math.floor(Math.random() * 100000);
    var rand = Math.floor(Math.random() * 89999 + 10000);
    var randStr = rand
    
    
    let randomnumber = 'ConfimrationCode' + '\n' + randStr
   
    objc.otp = randStr;
    objc.mobileNo = toMobile;


    axios({
        method: 'get',
        url: 'https://api.textlocal.in/send/',
       
        params: {

            apikey:'N2E0MzdhNjk0NjYxNDQ0NjRmNDE2YjQ5NDE0ZTY4NjM=',
            numbers:toMobile,
            sender:'SEVNAU',
            message:'We have received a request for password change of your Sevenchats account, If you wish to proceed then please click the link'+'  '+ randStr +', if you did not request then please ignore this message.'
            // message:'use' + randomnumber + 'as your verification code on Sevenchats the otp exprire in 10 minsTeam Sevenchats '

        }
      }).then(function (response) {
       console.log(response)
      });
     
         //delete the existed otps 
         const users = await db.Otp.findOne({ where: { mobileNo:param.to}})
         if (!users) {
            await db.Otp.create(objc);
            // sendOtpToMobile_valid(objc.mobileNo)
         }else {
            // console.log('users2')
            await users.destroy();
            await db.Otp.create(objc);
            // sendOtpToMobile_valid(mobileNo)
          
         }
        // }
        // else {
        //     throw 'mobileNo "' + param.mobileNo + '" is not Availabe in SevenchatsHR';
        // }
   
    // // // const user = await db.User.findByPk(userID);
    // if (!user) throw 'User not found';
    // return users;
}

async function validOtp(param) {
    const user = await db.Otp.findOne({ where: { email:param.email}})
    if (param.otp != user.otp) throw 'Otp Does not Match';
    // return user;
}

async function validMobileOtp(param) {
    console.log(param)
    const user = await db.Otp.findOne({ where: { mobileNo:param.mobileNo}})
    if (param.otp != user.otp) throw 'Otp Does not Match';
    // return user;
}



async function uploadProfileImg(param) {
  
const upload = mutler({dest:'uploads/'}).single("demo_image");
    const user = await db.Otp.findOne({ where: { email:param.email}})
    if (param.otp != user.otp) throw 'Otp Does not Match';
    return user;
}




async function sendOtpToMobile_valid(param) {
    // console.log(param)
    // const user = await db.Otp.findOne({ where: { email:param.email}})
    // if (param.otp != user.otp) throw 'Otp Does not Match';
    // return user;
    let html_code = "https://api.textlocal.in/send/?apikey=N2E0MzdhNjk0NjYxNDQ0NjRmNDE2YjQ5NDE0ZTY4NjM=&numbers=9966141512&sender=SEVNAU&message=We have received a request for password change of your Sevenchats account, If you wish to proceed then please click the link https://sevenchats.com, if you did not request then please ignore this message.";
    request(html_code, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log('success') // Print the google web page.
     }
})
return 'logmessage'


}
