const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require("sequelize");
const userServices  = require("shortid");
const userService = require('./salslips.service');
const attendanceService = require('../Attendance/attendance.service');
const usersal = require('../Salary/salary.service');
const PDFDocument = require('pdfkit');
var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require("path");

// const { html_to_pdf } = require(".");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
var html_to_pdf = require('html-to-pdf');





let data = [];
module.exports = {
    
    create,
    getAll,
    getById,
    update,
    delete: _delete,
    getgenerateSlips,
   
    
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





async function getgenerateSlips(userID) {

 //get the user 

 console.log('this is calling',userID)

 const user = await db.User.findOne({ where: { userID: userID } })
 const userSalDetails = await db.Salary.findOne({ where: { userID: userID } })
 console.log(userSalDetails)
  
  const dataBinding = {
    items: [
      {
        name: "Name",
        price: user.firstName + user.firstName,
      },
      {
        name: "Bank Name",
        price: user.bankName + " " + 'Bank',
      },
      {
        name: 'DOJ',
        price: user.Doj,
      },
      {
        name: "workingDays",
        price: 30,
      },
      {
        name: 'Location',
        price: 'Bangalore',
      },
    ],
    itemss: [
      {
        name: "Basic",
        price: userSalDetails.basicPay,
      },
      {
        name: "HRA",
        price: userSalDetails.hra,
      },
      {
        name: 'Conveyance',
        price: '800.00',
      },
      {
        name: "Special_Allowance",
        price: userSalDetails.specialAllowance,
      },
      
    ],
    items2: [
      {
        name: "Designation",
        price: 24000.00,
      },
      {
        name: "Bank A/c No.",
        price: '9600.00',
      },
      {
        name: 'PAN',
        price: '800.00',
      },
      {
        name: "Absent Days",
        price: '25,600.00',
      },
      {
        name: "LOP Days",
        price: '25,600.00',
      },
      
      
    ],

    total: 600,
    GrossEarnings:'60,000.00',
    GrossDeductions:'200.00',
    NETPAY:'59,800.00',
    isWatermark: false,
  };



  const dataBinding_Amount = {
    itemss: [
      {
        name: "Basic",
        price: 'kankanala Nagaraju',
      },
      {
        name: "HRA",
        price: 999979839423444,
      },
      {
        name: 'Conveyance',
        price: 300,
      },
      {
        name: "Special_Allowance",
        price: 30,
      },
      
    ],
    total: 900,
    isWatermark: false,
  };

  const templateHtml = fs.readFileSync(
    path.join(process.cwd(), "invoice.html"),
    "utf8"
  );

  const options = {
    format: "A4",
    headerTemplate: "<p></p>",
    footerTemplate: "<p></p>",
    displayHeaderFooter: false,
    margin: {
      top: "40px",
      bottom: "100px",
    },
    printBackground: true,
    path: "invoice_nagaraju.pdf",
  };

  await html_to_pdfs(templateHtml, dataBinding,dataBinding_Amount, options);

}

async function html_to_pdfs(templateHtml, dataBinding,dataBinding_Amount, options) {
  
  console.log("Done: invoice.pdf is created!");

 
    console.log("Done: invoice.pdf is created!");
    const template = handlebars.compile(templateHtml);
    const finalHtml = encodeURIComponent(template(dataBinding,dataBinding_Amount));
  
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
      waitUntil: "networkidle0",
    });
    // console('logmessage',options)
    await page.pdf(options);
    await browser.close();
  

}
