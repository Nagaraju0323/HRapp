const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
let data = [];
module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ DepName, password }) {
    const user = await db.Departments.scope('withHash').findOne({ where: { DepName } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Department is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.Departments.findAll();

}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.Departments.findOne({ where: { DepName: params.DepName } })) {
        
        throw 'Department "' + params.DepName + '" is already taken';
        // throw {error: "hello world"}
    }
  
    await db.Departments.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const emailChanged = params.DepName && user.DepName !== params.DepName;
    if (emailChanged && await db.Departments.findOne({ where: { DepName: params.DepName } })) {
        throw 'Department "' + params.DepName + '" is already taken';
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

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}