const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.User = require('../users/user.model')(sequelize);
    db.Departments = require('../Departments/department.model')(sequelize);
    db.Hr = require('../Hr/hr.model')(sequelize);
    db.Attendace = require('../Attendance/attendance.model')(sequelize);
    db.Otp = require('../Otp/otp.model')(sequelize);
    db.Leave = require('../Leave/leave.model')(sequelize);
    db.Email = require('../Email/email.model')(sequelize);
    db.Event = require('../Event/event.model')(sequelize);
    db.Holiday = require('../Holiday/holiday.model')(sequelize);
    db.LeaveManagment = require('../LeaveManagment/leaveManagment.model')(sequelize);
    db.Salary = require('../Salary/salary.model')(sequelize);
    db.SalSlips = require('../SalSlips/salslips.model')(sequelize);
    db.Compoff = require('../Compoff/compoff.model')(sequelize);
    db.Admin = require('../Admin/admin.model')(sequelize);
   
    // db.Attendace.removeAttribute('id');

    
    // sync all models with database
    await sequelize.sync();
}