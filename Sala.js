const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Sala = sequelize.define("sala",{
        id:{
            type:Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        naziv:Sequelize.STRING,
        zaduzenaOsoba:Sequelize.INTEGER
    })
    return Sala;
};