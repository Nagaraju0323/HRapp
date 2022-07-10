const { DataTypes } = require('sequelize');
const userService = require('./hrAttendace.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        departmentName: { type: DataTypes.STRING, allowNull:false},
        userID: { type: DataTypes.STRING, allowNull:false},

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

    return sequelize.define('HRAttendaceTbl', attributes, options);
}