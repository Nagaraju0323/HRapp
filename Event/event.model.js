const { DataTypes } = require('sequelize');
const userService = require('./event.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        eventTitle: { type: DataTypes.STRING, allowNull: true },
        evnetDescription: { type: DataTypes.STRING, allowNull: true },
        evnetStartDate: { type: DataTypes.STRING, allowNull: true },
        evnetEndDate: { type: DataTypes.STRING, allowNull: true },
        evnetUploadImg: { type: DataTypes.STRING, allowNull: true },
        evnetLocation: { type: DataTypes.STRING, allowNull: true },
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

    return sequelize.define('Event', attributes, options);
}