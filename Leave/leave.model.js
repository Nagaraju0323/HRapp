const { DataTypes } = require('sequelize');
const userService = require('./leave.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        senderEmail: { type: DataTypes.STRING, allowNull: true },
        sendTo: { type: DataTypes.JSON,allowNull: true},
        leaveType: { type: DataTypes.INTEGER , allowNull: true },
        titleType: { type: DataTypes.STRING, allowNull: true },
        descriptionType: { type: DataTypes.STRING, allowNull: true },
        // duationDates: { type: DataTypes.JSON, allowNull: true },
        startDate: { type: DataTypes.STRING, allowNull: true },
        endDate: { type: DataTypes.STRING, allowNull: true },
        userID: { type: DataTypes.STRING, allowNull:true},
        leaveStatus: { type: DataTypes.INTEGER, allowNull:true},
        
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

    return sequelize.define('Leave', attributes, options);
}