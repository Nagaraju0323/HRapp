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
const pdf2base64 = require('pdf-to-base64');
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
var html_to_pdf = require('html-to-pdf');
const { param } = require('./salslips.controller');

let data = [];
module.exports = {
    
    create,
    getAll,
    getById,
    update,
    delete: _delete,
    getgenerateSlips,
    downloadSalSlips,
    DeletePdfFile
   
    
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
  if (await db.SalSlips.findOne({ where: { userID: params.userID,salarymonth:params.salarymonth } })) {
    throw 'salary is already added';
}
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

async function getgenerateSlips(params) {

 //get the user 

 const user = await db.User.findOne({ where: { userID: params.userID } })
 const userSalDetails = await db.Salary.findOne({ where: { userID: params.userID } })
 const userDetails = await db.Salary.findOne({ where: { userID: params.userID } })

  let totalpresent =  params.presentDays;
  let totalabsent =  params.absentDays;
  let totalLeaves =  params.applyLeavesLeaves;
  let totalDays = params.TotalDays
 
   let totalsalary = parseFloat(params.ctc)/(totalpresent);
   console.log('totalsalary',parseFloat(totalsalary))

   const getDays = new Date(params.year, params.month, 0).getDate()
   let objc = {};

  
  const dataBinding = {
    items: [
      {
        name: "Name",
        price: user.firstName + user.firstName,
        percentage:'Designation',
        quantity:user.departmentName
      },
      {
        name: "Bank Name",
        price: user.bankName + " " + 'Bank',
        percentage:'Bank A/c No.',
        quantity:user.accountNo
      },
      {
        name: 'DOJ',
        price: user.Doj,
        percentage:'PAN',
        quantity:user.PAN
      },
      {
        name: "workingDays",
        price: getDays,
        percentage:'Absent Days',
        quantity:0
      },
      {
        name: 'Location',
        price: 'Bangalore',
        percentage:'LOP Days',
        quantity:0
      },
    ],
    itemss: [
      {
        name: "Basic",
        price: userSalDetails.basicPay.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        percentage:'Professional Tax',
        quantity:200
      },
      {
        name: "HRA",
        price: userSalDetails.hra.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        percentage:'Income Tax',
        quantity:'NIL'
      },
      {
        name: 'Conveyance',
        price: userSalDetails.Conveyance.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        percentage:"",
        quantity:""
      },
      {
        name: "Special Allowance",
        price: userSalDetails.specialAllowance.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        percentage:"",
        quantity:""
      },
      
    ],
  
    GrossEarnings:userSalDetails.ctc.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    GrossDeductions:'200.00',
    NETPAY:'59,800.00',
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
      bottom: "200px",
    },
    printBackground: true,
    // path: user.firstName + "_"+ user.lastName + ".pdf",
    path: user.firstName + ".pdf",
  };

  // console.log(process.cwd() +"/"+ user.firstName + user.lastName + ".pdf");
  pdf2base64(process.cwd() +"/"+ user.firstName + ".pdf")
  .then(
      (response) => {
          // console.log(response); //cGF0aC90by9maWxlLmpwZw==
          objc.userID = params.userID;
          objc.salarymonth = params.month;
          objc.salaryyear = params.year;
          const contentType = 'application/pdf';
          const b64Data = response ;
          const blob = b64toBlob(b64Data, contentType);
          // console.log('blobmessage',blob);
          const blobUrl = URL.createObjectURL(blob);
           objc.salarySlips = blobUrl;
           db.SalSlips.create(objc);



          // var base64EncodedPDF = response; // the encoded string
          // var decodedPdfContent = atob(base64EncodedPDF);
          // var byteArray = new Uint8Array(decodedPdfContent.length)
          // for(var i=0; i<decodedPdfContent.length; i++){
          //     byteArray[i] = decodedPdfContent.charCodeAt(i);
          // }
          // var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
          // var _pdfurl = URL.createObjectURL(blob);
          // console.log('pdfFormat',_pdfurl);

          // const base64String = await convertBlobToBase64(blob);

          // convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
          //   const reader = new FileReader;
          //   reader.onerror = reject;
          //   reader.onload = () => {
          //       resolve(reader.result);
          //   };
          //   reader.readAsDataURL(blob);
          // });


      }
  )
  .catch(
      (error) => {
          console.log(error); //Exepection error....
      }
  )

const paths = process.cwd() +"/"+ user.firstName + user.lastName + ".pdf"


  await html_to_pdfs(templateHtml, dataBinding, options);
  //  downloadSalSlips(paths)
}

async function html_to_pdfs(templateHtml, dataBinding, options) {
 
    console.log("Done: invoice.pdf is created!");
    const template = handlebars.compile(templateHtml);
    const finalHtml = encodeURIComponent(template(dataBinding));
  
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

const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

// const blobToBase64 = (url) => {
//   return new Promise((resolve, _) => {
//     // do a request to the blob uri
//     const response = await fetch(url);

//     // response has a method called .blob() to get the blob file
//     const blob = await response.blob();

//     // instantiate a file reader
//     const fileReader = new FileReader();

//     // read the file
//     fileReader.readAsDataURL(blob);

//     fileReader.onloadend = function(){
//       resolve(fileReader.result); // Here is the base64 string
//     }
//   });
// };


async function downloadSalSlips(params) {

  const userSalDetails = await db.SalSlips.findOne({ where: { userID: params.userID,salarymonth:params.salarymonth } });
  let url = userSalDetails.salarySlips;
  
console.log('message from load ',await convertBlobToBase64(url));

}



const convertBlobToBase64 = async (blob) => { // blob data
 
  return await blobToBase64(blob);
}

const blobToBase64 = blob => new Promise((resolve, reject) => {
  
// console.log('blobtobase64');
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  console.log('blobtobase64',blob);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

async function DeletePdfFile(params){
  

}

// convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
//   const reader = new FileReader;
//   reader.onerror = reject;
//   reader.onload = () => {
//       resolve(reader.result);
//   };
//   reader.readAsDataURL(blob);
// });
