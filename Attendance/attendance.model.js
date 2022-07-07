const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        presentDay: { type: DataTypes.STRING, allowNull: false },
        absentDay: { type: DataTypes.STRING, allowNull: true },
        userid: { type: DataTypes.STRING, allowNull: false },
        inSatus: { type: DataTypes.STRING, allowNull: true },
        outStatus: { type: DataTypes.STRING, allowNull: true },
        // leaveDay: { type: DataTypes.STRING, allowNull: false },
        // LeaveDay: { type: DataTypes.STRING, allowNull: false },
        // sickLeave: { type: DataTypes.STRING, allowNull: false },
        // casualLeave: { type: DataTypes.STRING, allowNull: false },
        // compOff: { type: DataTypes.STRING, allowNull: false },
        // Userid: { type: DataTypes.STRING, allowNull: false },
        inTime: { type: DataTypes.STRING, allowNull: false },
        outTime: { type: DataTypes.STRING, allowNull: true },
        // currentDate: { type: DataTypes.STRING, allowNull: false },
        // hash: { type: DataTypes.STRING, allowNull: false }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['hash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('Attendance', attributes, options);
}