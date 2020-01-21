const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Osoblje = sequelize.define("osoblje",{
        ime:Sequelize.STRING,
        prezime:Sequelize.STRING,
        uloga:Sequelize.STRING
    })
    return Osoblje;
};
/*id:{
            type:Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },*/