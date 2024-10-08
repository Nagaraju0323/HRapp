require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const {errorHandler} = require('_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// api routes
app.use('/users', require('./users/users.controller'));

app.use('/departments', require('./Departments/department.controller'));

app.use('/hr', require('./Hr/hr.controller'));

app.use('/Attendace', require('./Attendance/attendance.controller'));

app.use('/Otp', require('./Otp/otp.controller'));

app.use('/Leave', require('./Leave/leave.controller'));


app.use('/Email', require('./Email/email.controller'));

app.use('/Event', require('./Event/event.controller'));

app.use('/Holiday', require('./Holiday/holiday.controller'));

app.use('/LeaveManagment', require('./LeaveManagment/leaveManagment.controller'));

app.use('/Salary', require('./Salary/salary.controller'));

app.use('/SalSlips', require('./SalSlips/salslips.controller'));

app.use('/Compoff', require('./Compoff/compoff.controller'));

app.use('/Admin', require('./Admin/admin.controller'));





// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));