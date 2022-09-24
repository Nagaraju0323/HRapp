const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const sgMail = require('@sendgrid/mail');
const axios = require('axios').default;
const apiKey =
    process.env.SENDGRID_API_KEY ||
    "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";
const apikeySms = "https://http-api.d7networks.com/send"


sgMail.setApiKey(apiKey);

module.exports = {
    userDeatilsExisted,
    authenticate,
    authenticateMobile,
    getAll,
    getById,
    create,
    update,
    updatehr,
    getUserDeatils,
    hrDeatailsUpdate,
    delete: _delete,
    sendOTPforgot,
    sendOTPforgotMobile,
    changePWDemail,
    changePWDmobile,
    resetPassword
};


async function userDeatilsExisted({ params }) {
  
    if (await db.Hr.findOne({ where: { email: params.email } })) {
        throw 'email "' + params.email + '" is already taken';
    }
    
    if (await db.Hr.findOne({ where: { mobileNo: params.mobileNo } })) {
        throw 'mobileNo "' + params.mobileNo + '" is already taken';
    }
    // authentication successful
  
}

async function authenticate({ email, password }) {
    const user = await db.Hr.scope('withHash').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'email or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}


async function authenticateMobile({ mobileNo, password }) {
    const user = await db.Hr.scope('withHash').findOne({ where: { mobileNo } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'email or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
  let userdata = await db.Hr.findAll();
    return await userdata;
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.Hr.findOne({ where: { email: params.email } })) {
        throw 'email "' + params.email + '" is already taken';
    }
    
    if (await db.Hr.findOne({ where: { mobileNo: params.mobileNo } })) {
        throw 'mobileNo "' + params.mobileNo + '" is already taken';
    }
    console.log('message')

  // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }
    var rand = Math.floor(Math.random() * 1000000);
    var randStr = rand
    params.userID = randStr

    params.activeStatus = "0";
    // save user
    await db.Hr.create(params);
}

async function update(id, params) {
    
    const user = await getUser(id);

    // validate
    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function updatehr(email, params) {
    const user = await getUseremail(params.email);
    if (user.activeStatus == "1"){
        params.activeStatus = 0
    }else {
        params.activeStatus = 1
    }
    // params.activeStatus = 1
    Object.assign(user, params);
    await user.save();
    return omitHash(user.get());
}
//HR deatils Update 
async function hrDeatailsUpdate(params) {
    console.log(params)
    const user = await getUserDeatils(params.userID);
    console.log('update')
    
    // params.activeStatus = 1
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
    const user = await db.Hr.findByPk(id);
    if (!user) throw 'HR not found';
    return user;
}
async function getUseremail(email) {
     
    const user = await db.Hr.findOne({ where: { email: email}});
    
    if (!user) throw 'HR not found';
    return user;
}
//get user Details with userID

async function getUserDeatils(userID) {
     
    console.log('this message',userID)
    const user = await db.Hr.findOne({ where: { userID: userID}});
    
    if (!user) throw 'HR not found';
    return user;
}



function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}


async function sendOTPforgot(param) {
    var objc = {}
    // const user = await db.User.findOne({ where: { email: param.email } })
    if (await db.Hr.findOne({ where: { email: param.email } })) {
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
    if (await db.Hr.findOne({ where: { mobileNo: param.to } })) {
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


//...reset Password userInfo
async function changePWDemail(param) {
    let params = {};
     params.password = param.password
   
    const userotp = await db.Otp.findOne({ where: { email:param.email}})
       if (param.otp != userotp.otp) throw 'Otp Does not Match';
   
       const user = await db.Hr.findOne({ where: { email: param.email } })
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
   
    //    return omitHash(user.get());
   
   }
   
   
   async function changePWDmobile(param) {
       let params = {};
        params.password = param.password
      
       const userotp = await db.Otp.findOne({ where: { mobileNo:param.mobileNo}})
          if (param.otp != userotp.otp) throw 'Otp Does not Match';
      
          const user = await db.Hr.findOne({ where: { mobileNo: param.mobileNo } })
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
      
        //   return omitHash(user.get());
      
      }

//...reset Password userInfo
async function resetPassword(params) {
    console.log('message')
    const user = await getUserID(params.userID);
    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

   user.update({
        params: params.hash 
    },{ where: { userID: params.userID }});

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    // return omitHash(user.get());
}

async function getUserID(userID) {
    console.log('resuserIDet',userID)
    const user = await db.Hr.findOne({ where: { userID: userID } })
    // const user = await db.User.findByPk(userID);
    if (!user) throw 'User not found';
    return user;
}