const { DataTypes } = require('sequelize');
// const userService = require('./otp.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        // userID: { type: DataTypes.STRING, allowNull: false },
        otp: { type: DataTypes.INTEGER, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true },
        mobileNo: { type: DataTypes.STRING, allowNull: true },
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