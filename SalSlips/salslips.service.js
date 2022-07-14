const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./salslips.service');
const PDFDocument = require('pdfkit');
var pdf = require("pdf-creator-node");
var fs = require("fs");
const doc = new PDFDocument();




let data = [];
module.exports = {
    
    create,
    getAll,
    getById,
    update,
    delete: _delete
    
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

async function create(params) {

    var html = fs.readFileSync("index.html", "utf8");
    // save user
    var options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "45mm",
            contents: '<div style="text-align: center;">Author: Shyam Hajare</div>'
        },
        footer: {
            height: "28mm",
            contents: {
                first: 'Cover page',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }
    };

    var users = [
        {
          name: "Shyam",
          age: "26",
        },
        {
          name: "Navjot",
          age: "26",
        },
        {
          name: "Vitthal",
          age: "26",
        },
      ];
      var document = {
        html: html,
        data: {
          users: users,
        },
        path: "./output.pdf",
        type: "",
      };



      pdf
      .create(document, options)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });


    await db.SalSlips.create(params);

    


}
async function getAll() {
    return await db.SalSlips.findAll();
}

async function update(userID, params) {
    const user = await getUser(userID);

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(userID) {
    const user = await getUser(userID);
    await user.destroy();
}

// helper functions

async function getUser(userID) {
    const user = await db.SalSlips.findOne({ where: { userID: userID } })
    if (!user) throw 'not found';
    return user;
}

async function getById(userID) {
    return await getUser(userID);
}
function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

