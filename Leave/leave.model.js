const { DataTypes } = require('sequelize');
const userService = require('./leave.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        senderEmail: { type: DataTypes.STRING, allowNull: true },
        sendTo: { type: DataTypes.JSON,allowNull: true},
        leveType: { type: DataTypes.INTEGER , allowNull: true },
        titleType: { type: DataTypes.STRING, allowNull: true },
        descriptionType: { type: DataTypes.STRING, allowNull: true },
        duationDates: { type: DataTypes.JSON, allowNull: true },
        statDate: { type: DataTypes.DATE, allowNull: true },
        endDate: { type: DataTypes.DATE, allowNull: true },
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