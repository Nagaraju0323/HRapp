const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

module.exports = {
    authenticate,
    authenticateMobile,
    getAll,
    getById,
    create,
    update,
    updatehr,
    delete: _delete
};

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
    let sqlResults = [
        {
            "data":userdata,
            "status": 200,
        }
    ];
   // var ress = JSON.stringify(sqlResults)
    return await sqlResults;
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.Hr.findOne({ where: { email: params.email } })) {
        throw 'email "' + params.email + '" is already taken';
    }
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


function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}


