const { DataTypes } = require('sequelize');
const userService = require('./holiday.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        holidayTitle: { type: DataTypes.STRING, allowNull: true },
        holidayDate: { type: DataTypes.STRING, allowNull: true },
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

    return sequelize.define('Holiday', attributes, options);
}