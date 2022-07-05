const { DataTypes } = require('sequelize');
const userService = require('./otp.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        // userID: { type: DataTypes.STRING, allowNull: false },
        otp: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        mobileNo: { type: DataTypes.STRING, allowNull: false },
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

    return sequelize.define('Otp', attributes, options);
}