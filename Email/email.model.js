const { DataTypes } = require('sequelize');
const userService = require('./email.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        senderEmail: { type: DataTypes.STRING, allowNull: true },
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