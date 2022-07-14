const { DataTypes } = require('sequelize');
const userService = require('./salslips.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        userID: { type: DataTypes.INTEGER, allowNull: true },
        salAmount: { type: DataTypes.INTEGER, allowNull: true },
        workingDays: { type: DataTypes.INTEGER, allowNull: true }
        
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

    return sequelize.define('SalSlips', attributes, options);
}