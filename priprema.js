const db = require('./db.js')
/*db.sequelize.sync({force:true}).then(function(){
    inicializacija().then(function(){
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
        process.exit();
    });
});*/

//rjesenje tako da se baza pravi prilikom pokretanja index-a, a da testovi prolaze
function inicijalizacijaZbogTestova(callback) 
{
    db.sequelize.sync({force:true}).then(function(){
        inicializacija().then(
            function(){
                console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
                callback();
            }).catch(function(error){console.log(error);});
    }).catch(function(error){console.log(error);});
}

db.inicijalizacijaZbogTestova = inicijalizacijaZbogTestova;

function inicializacija(){
    var terminiListaPromisea=[];
    var osobljeListaPromisea=[];
    var rezervacijeListaPromisea=[];
    var saleListaPromisea=[];
    return new Promise(function(resolve,reject){
        osobljeListaPromisea.push(db.osoblje.create({ime:'Neko', prezime:'Nekic', uloga:'profesor'}));
        osobljeListaPromisea.push(db.osoblje.create({ime:'Drugi', prezime:'Neko', uloga:'asistent'}));
        osobljeListaPromisea.push(db.osoblje.create({ime:'Test', prezime:'Test', uloga:'asistent'}));
        Promise.all(osobljeListaPromisea).then(function(osobe){
            var neko=osobe.filter(function(a){return a.ime==='Neko'})[0];
            var drugi=osobe.filter(function(a){return a.ime==='Drugi'})[0];
            var test=osobe.filter(function(a){return a.ime==='Test'})[0];
            saleListaPromisea.push(
                db.sala.create({naziv:'1-11'}).then(function(k){
                    k.setSalaZaduzenaOsoba(neko);
                    //console.log(k); ne treba u uglastim ko kod njega...
                    return new Promise(function(resolve, reject){resolve(k);})
                })
            );
            saleListaPromisea.push(
                db.sala.create({naziv:'1-15'}).then(function(k){
                    k.setSalaZaduzenaOsoba(drugi);
                    return new Promise(function(resolve, reject){resolve(k);})
                })
            );
            Promise.all(saleListaPromisea).then(function(sale){
                var sala111 = sale.filter(function(a){return a.naziv==='1-11'})[0];
                terminiListaPromisea.push(db.termin.create({redovni:false, dan:null, datum:'1.1.2020', semestar:null, pocetak: '12:00', kraj: '13:00'}));
                terminiListaPromisea.push(db.termin.create({redovni:true, dan:0, datum:null, semestar:'zimski', pocetak: '13:00', kraj: '14:00'}));
                Promise.all(terminiListaPromisea).then(function(termini){
                    var termin1 = termini.filter(function(a){return a.pocetak==='12:00'})[0];
                    var termin2 = termini.filter(function(a){return a.pocetak==='13:00'})[0];
                    //moze i ovako jednostavnije
                    rezervacijeListaPromisea.push(db.rezervacija.create({termin:termin1.id, sala:sala111.id, osoba:neko.id}));
                    rezervacijeListaPromisea.push(db.rezervacija.create({termin:termin2.id, sala:sala111.id, osoba:test.id}));
                    Promise.all(rezervacijeListaPromisea).then(function(rezervacije){
                        resolve(rezervacije);
                    }).catch(function(err){console.log("Rezervacije greska "+err);});
                }).catch(function(err){console.log("Termini greska "+err);});
            }).catch(function(err){console.log("Sale greska "+err);});
        }).catch(function(err){console.log("Osoblje greska "+err);});
        /*saleListaPromisea.push(db.sala.create({naziv:'1-11', zaduzenaOsoba:1}));
        saleListaPromisea.push(db.sala.create({naziv:'1-15', zaduzenaOsoba:2}));*/
    });
}
module.exports = db;