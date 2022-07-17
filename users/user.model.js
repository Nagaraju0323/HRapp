const { DataTypes } = require('sequelize');
const userService = require('./user.service');

module.exports = model;

function model(sequelize) {
    const attributes = {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        mobileNo: { type: DataTypes.STRING, allowNull: false },
        gender: { type: DataTypes.STRING, allowNull: false },
        Dob: { type: DataTypes.STRING, allowNull:false},
        departmentName: { type: DataTypes.STRING, allowNull:false},
        Address: { type: DataTypes.STRING, allowNull:false},
        profileImg: { type: DataTypes.STRING, allowNull:false},
        userID: { type: DataTypes.INTEGER, allowNull:false},
        accountNo: { type: DataTypes.STRING, allowNull:true},
        Doj: { type: DataTypes.STRING, allowNull:true},
        bankName: { type: DataTypes.STRING, allowNull:true},
        PAN: { type: DataTypes.STRING, allowNull:true},
        hash: { type: DataTypes.STRING, allowNull: false }
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

    return sequelize.define('User', attributes, options);
}