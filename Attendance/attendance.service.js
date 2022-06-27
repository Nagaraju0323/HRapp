const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

module.exports = {
    authenticate,
    getAll,
    getAllbyId,
    getById,
    create,
    update,
    delete: _delete
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

async function getAllbyId(userid) {
    const user = await db.Attendace.findAndCountAll({ where: { userid } });
    let data = {
        count: user.count,
        data: user.rows,
        status : 0
     }
    return await data
}


async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    // if (await db.Attendace.findOne({ where: { email: params.email } })) {
    //     throw 'email "' + params.eail + '" is already taken';
    // }

    // // hash password
    // if (params.password) {
    //     params.hash = await bcrypt.hash(params.password, 10);
    // }

    // save user
    await db.Attendace.create(params);
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

// helper functions

async function getUser(id) {
    const user = await db.Attendace.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}