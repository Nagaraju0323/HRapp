const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        
        userID: { type: DataTypes.INTEGER, allowNull: false },
        resonOf: { type: DataTypes.STRING, allowNull: false },
        applydate: { type: DataTypes.STRING, allowNull: true },
        takendate: { type: DataTypes.STRING, allowNull: true },
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

    return sequelize.define('Compoff', attributes, options);
}

