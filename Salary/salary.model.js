const { DataTypes } = require('sequelize');
const userService = require('./salary.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        userID: { type: DataTypes.INTEGER, allowNull: true },
        basicPay: { type: DataTypes.INTEGER, allowNull: true },
        hra: { type: DataTypes.INTEGER, allowNull: true },
        specialAllowance : { type: DataTypes.INTEGER, allowNull: true },
        travelAllowance: { type: DataTypes.INTEGER, allowNull: true },
        Esi: { type: DataTypes.INTEGER, allowNull: true },
        employeerPF: { type: DataTypes.INTEGER, allowNull: true },
        employeePF: { type: DataTypes.INTEGER, allowNull: true },
        ctc: { type: DataTypes.INTEGER, allowNull: true },
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

    return sequelize.define('Salary', attributes, options);
}