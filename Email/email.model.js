const { DataTypes } = require('sequelize');
const userService = require('./email.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        email: { type: DataTypes.STRING, allowNull: true },
        mobileNo: { type: DataTypes.STRING, allowNull: true },
        userID: { type: DataTypes.INTEGER, allowNull:false},
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

    return sequelize.define('Email', attributes, options);
}