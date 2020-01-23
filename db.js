const Sequelize = require("sequelize");
const sequelize = new Sequelize("DBWT19","root","root",{host:"127.0.0.1",dialect:"mysql",logging:false});
const db={};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

//import modela
db.osoblje = sequelize.import(__dirname+'/Osoblje.js');
db.rezervacija = sequelize.import(__dirname+'/Rezervacija.js');
db.termin = sequelize.import(__dirname+'/Termin.js');
db.sala = sequelize.import(__dirname+'/Sala.js');

//relacije
//vise na jedan
db.rezervacija.belongsTo(db.osoblje, {foreignKey: 'osoba', as: 'rezervacijaOsoba'}); // Adds osoba to rezervacija
db.osoblje.hasMany(db.rezervacija, {foreignKey: 'osoba', as: 'osobaRezervacija'})
//vise na jedan
db.rezervacija.belongsTo(db.sala, {foreignKey: 'sala', as: 'rezervacijaSala'}); // Adds sala to rezervacija
db.sala.hasMany(db.rezervacija, {foreignKey: 'sala', as: 'salaRezervacija'})
//jedan na jedan
db.rezervacija.belongsTo(db.termin, {foreignKey: 'termin', as: 'rezervacijaTermin'});
db.termin.hasOne(db.rezervacija, {foreignKey: 'termin', as: 'terminRezervacija'});
//jedan na jedan
db.sala.belongsTo(db.osoblje, {foreignKey: 'zaduzenaOsoba', as: 'salaZaduzenaOsoba'});
db.osoblje.hasOne(db.sala, {foreignKey: 'zaduzenaOsoba', as: 'zaduzenaOsobaSala'});

/*
// Veza 1-n vise knjiga se moze nalaziti u biblioteci
db.biblioteka.hasMany(db.knjiga,{as:'knjigeBiblioteke'});

// Veza n-m autor moze imati vise knjiga, a knjiga vise autora
db.autorKnjiga=db.knjiga.belongsToMany(db.autor,{as:'autori',through:'autor_knjiga',foreignKey:'knjigaId'});
db.autor.belongsToMany(db.knjiga,{as:'knjige',through:'autor_knjiga',foreignKey:'autorId'});
*/

module.exports=db;