const { DataTypes } = require('sequelize');
const userService = require('./leaveManagment.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        userID: { type: DataTypes.INTEGER, allowNull: true },
        casualLeaves: { type: DataTypes.INTEGER, allowNull: true },
        sickLeaves: { type: DataTypes.INTEGER, allowNull: true },
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

    return sequelize.define('LeaveManagment', attributes, options);
}