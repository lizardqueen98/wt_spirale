const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Sala = sequelize.define("sala",{
        naziv:Sequelize.STRING,
        zaduzenaOsoba:Sequelize.INTEGER
    })
    return Sala;
};