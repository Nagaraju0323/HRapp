const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { date } = require('joi');

module.exports = {
    authenticate,
    getAll,
    getCompoofID,
    getById,
    takecompoff,
    getUserIDDate,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password }) {


    const user = await db.Compoff.scope('withHash').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Department is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.Compoff.findAll();

}

async function getCompoofID(params) {
    return await getUserID(params.userID);
}

async function getById(id) {
    return await getUser(id);
}


async function create(params) {
    // validate
    if (await db.Compoff.findOne({ where: { userID:params.userID,applydate:params.applydate}})) {
        throw 'compOff Already applied';
    }
    // save user
    await db.Compoff.create(params);
}

async function takecompoff(params) {
    // validate
    
    const user = await db.Compoff.findOne({ where: { userID:params.userID,applydate:params.applydate}});
    if (!user) throw 'apply date is not found';
    const users = db.Compoff.findOne({ where: { userID: params.userID,applydate:params.applydate}})
    if (!user) throw 'userID not Found';
    await user.destroy();
    return 'successfully'
    // save user
    // await db.Compoff.create(params);
}



async function update(id, params) {
    const user = await getUser(id);

    // validate
    const emailChanged = params.DepName && user.DepName !== params.DepName;
    if (emailChanged && await db.Departments.findOne({ where: { DepName: params.DepName } })) {
        throw 'Comoboffer "' + params.DepName + '" is already taken';
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

// helper functions

async function getUser(id) {
    const user = await db.Departments.findByPk(id);
    if (!user) throw 'Department not found';
    return user;
}

async function getUserIDDate(param) {
    console.log('console.log',param.userID)
    console.log('console.log',param.applydate)
    const user = db.Compoff.findOne({ where: { userID: param.userID,applydate:param.applydate}})
    if (!user) throw 'userID not Found';
    let userdata =  user.destroy();
    return userdata
}


async function getUserID(userID) {
    console.log('userID',userID)
    const user = await db.Compoff.findAndCountAll({ where: { userID :userID} });
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

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}