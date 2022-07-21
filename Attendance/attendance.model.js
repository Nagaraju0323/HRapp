const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        presentDay: { type: DataTypes.STRING, allowNull: true },
        absentDay: { type: DataTypes.STRING, allowNull: true },
        userID: { type: DataTypes.INTEGER, allowNull: true },
        inStatus: { type: DataTypes.STRING, allowNull: true },
        outStatus: { type: DataTypes.STRING, allowNull: true },
        inTime: { type: DataTypes.STRING, allowNull: true },
        outTime: { type: DataTypes.STRING, allowNull: true },
        startDate: { type: DataTypes.STRING, allowNull: true },
        endDate: { type: DataTypes.STRING, allowNull: true },
        leaveType: { type: DataTypes.STRING, allowNull: true },
        leaveStatus: { type: DataTypes.STRING, allowNull: true },
        leaveCount: { type: DataTypes.INTEGER, allowNull: true },
        holidayStatus: { type: DataTypes.STRING, allowNull: true }
     
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