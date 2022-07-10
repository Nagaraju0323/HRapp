const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        presentDay: { type: DataTypes.STRING, allowNull: false },
        absentDay: { type: DataTypes.STRING, allowNull: true },
        userID: { type: DataTypes.INTEGER, allowNull: false },
        inSatus: { type: DataTypes.STRING, allowNull: true },
        outStatus: { type: DataTypes.STRING, allowNull: true },
        inTime: { type: DataTypes.STRING, allowNull: false },
        outTime: { type: DataTypes.STRING, allowNull: true },
     
     
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

    return sequelize.define('Attendance', attributes, options);
}