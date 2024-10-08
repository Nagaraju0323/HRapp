const { DataTypes } = require('sequelize');
const userService = require('./salslips.service');


module.exports = model;

function model(sequelize) {
    const attributes = {
        userID: { type: DataTypes.INTEGER, allowNull: true },
        salarySlips:{ type: DataTypes.STRING, allowNull: true },
        salaryyear:{ type: DataTypes.STRING, allowNull: true },
        salarymonth:{ type: DataTypes.STRING, allowNull: true },
        
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